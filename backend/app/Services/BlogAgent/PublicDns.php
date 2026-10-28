<?php

namespace App\Services\BlogAgent;

class PublicDns
{
    public function addresses(string $host): array
    {
        $records = @dns_get_record($host, DNS_A | DNS_AAAA);

        return array_values(array_filter(array_map(fn ($r) => $r['ip'] ?? $r['ipv6'] ?? null, $records ?: [])));
    }

    public function pin(string $host): string
    {
        $addresses = $this->addresses($host);
        if (! $addresses) {
            throw new AgentException('source_dns_failed');
        }
        foreach ($addresses as $ip) {
            $packed = @inet_pton($ip);
            $hex = $packed === false ? '' : bin2hex($packed);
            // Accept ordinary global IPv6 unicast only, excluding transition
            // ranges that can encode an otherwise blocked IPv4 destination.
            $unsafeV6 = strlen($hex) === 32 &&
                (! in_array($hex[0], ['2', '3'], true) || str_starts_with($hex, '2002') || str_starts_with($hex, '20010000'));
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_GLOBAL_RANGE) || $unsafeV6) {
                throw new AgentException('source_private_address');
            }
        }

        return $addresses[0];
    }
}
