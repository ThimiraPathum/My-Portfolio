<?php

namespace App\Services\BlogAgent;

use DOMDocument;
use DOMXPath;

class SafeSourceFetcher
{
    public function __construct(private PublicDns $dns, private SourceTransport $transport) {}

    public function fetch(string $url): array
    {
        $parts = parse_url($url);
        $host = strtolower($parts['host'] ?? '');
        if (! filter_var($url, FILTER_VALIDATE_URL) || strlen($url) > 1500 ||
            ($parts['scheme'] ?? '') !== 'https' || isset($parts['user']) || isset($parts['pass']) ||
            isset($parts['fragment']) || isset($parts['query']) || ($parts['port'] ?? 443) !== 443 ||
            ! in_array($host, config('blog_agent.source_hosts'), true)) {
            throw new AgentException('source_url_blocked');
        }
        $response = $this->transport->get($url, $host, $this->dns->pin($host));
        if (strlen($response['body']) > config('blog_agent.max_source_bytes')) {
            throw new AgentException('source_too_large');
        }
        $type = strtolower(explode(';', $response['type'])[0]);
        if (! in_array($type, ['text/html', 'text/plain'], true)) {
            throw new AgentException('source_type_unsupported');
        }
        $published = null;
        $title = $host;
        $text = $response['body'];
        if ($type === 'text/html') {
            $previous = libxml_use_internal_errors(true);
            try {
                $dom = new DOMDocument;
                $dom->loadHTML('<?xml encoding="UTF-8">'.$text, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
                $xpath = new DOMXPath($dom);
                $title = trim($xpath->evaluate('string(//title)')) ?: $host;
                $date = $xpath->evaluate('string(//meta[@property="article:published_time" or @name="datePublished"]/@content)');
                if (preg_match('/^\d{4}-\d{2}-\d{2}(?:T.*)?$/', $date)) {
                    $timestamp = strtotime($date);
                    if ($timestamp !== false && $timestamp <= time()) {
                        $published = date('Y-m-d', $timestamp);
                    }
                }
                foreach ($xpath->query('//script|//style|//nav|//footer|//header|//noscript|//form') as $node) {
                    $node->parentNode?->removeChild($node);
                }
                $root = $xpath->query('//main|//article')->item(0) ?? $dom->documentElement;
                $text = $root?->textContent ?? '';
            } finally {
                libxml_clear_errors();
                libxml_use_internal_errors($previous);
            }
        }
        $text = preg_replace('/\s+/u', ' ', mb_convert_encoding($text, 'UTF-8', 'UTF-8'));
        $text = trim(mb_substr($text, 0, min(24000, config('blog_agent.max_source_chars'))));
        if (mb_strlen($text) < 200) {
            throw new AgentException('source_insufficient_text');
        }

        return ['url' => $url, 'title' => mb_substr($title, 0, 180), 'text' => $text,
            'published_at' => $published, 'retrieved_at' => now()->toIso8601String(), 'sha256' => hash('sha256', $text)];
    }
}
