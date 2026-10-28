<?php

namespace App\Services\BlogAgent;

/** Separate cURL handle per source: no auth, cookies, proxy, redirects or crawling. */
class SourceTransport
{
    public function get(string $url, string $host, string $ip): array
    {
        if (! extension_loaded('curl')) {
            throw new AgentException('source_curl_required');
        }
        $limit = min(1048576, max(1024, (int) config('blog_agent.max_source_bytes')));
        $body = '';
        $tooLarge = false;
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_PROXY => '',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => min(20, max(1, (int) config('blog_agent.source_timeout'))),
            CURLOPT_RESOLVE => [$host.':443:'.(str_contains($ip, ':') ? '['.$ip.']' : $ip)],
            CURLOPT_USERAGENT => 'PortfolioResearchBot/2.0 (limited editorial research)',
            CURLOPT_HTTPHEADER => ['Accept: text/html, text/plain;q=0.9'],
            CURLOPT_ENCODING => '',
            // The callback sees decompressed bytes, including chunked responses.
            CURLOPT_WRITEFUNCTION => function ($curl, string $chunk) use (&$body, &$tooLarge, $limit): int {
                if (strlen($body) + strlen($chunk) > $limit) {
                    $tooLarge = true;

                    return 0;
                }
                $body .= $chunk;

                return strlen($chunk);
            },
        ]);
        try {
            $ok = curl_exec($handle);
            $status = curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
            $type = (string) curl_getinfo($handle, CURLINFO_CONTENT_TYPE);
            if ($tooLarge) {
                throw new AgentException('source_too_large');
            }
            if ($ok === false) {
                throw new AgentException(match (curl_errno($handle)) {
                    60 => 'source_tls_failed', // CURLE_PEER_FAILED_VERIFICATION (libcurl)
                    28 => 'source_timeout', // CURLE_OPERATION_TIMEDOUT (libcurl)
                    default => 'source_unavailable',
                });
            }
            if ($status >= 300 && $status < 400) {
                throw new AgentException('source_redirect_blocked');
            }
            if ($status !== 200) {
                throw new AgentException('source_unavailable');
            }

            return ['body' => $body, 'type' => $type];
        } finally {
            curl_close($handle);
        }
    }
}
