<?php

namespace Tests\Feature;

use App\Services\BlogAgent\AgentException;
use App\Services\BlogAgent\PublicDns;
use App\Services\BlogAgent\ResearchService;
use App\Services\BlogAgent\SafeSourceFetcher;
use App\Services\BlogAgent\SourceTransport;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\BlogAgentFixtures as F;
use Tests\TestCase;

class BlogAgentResearchTest extends TestCase
{
    #[DataProvider('blockedUrls')]
    public function test_untrusted_urls_are_blocked_before_dns_or_http(string $url): void
    {
        $dns = $this->mock(PublicDns::class, fn ($m) => $m->shouldNotReceive('pin'));
        $transport = $this->mock(SourceTransport::class, fn ($m) => $m->shouldNotReceive('get'));
        $this->expectExceptionMessage('source_url_blocked');
        (new SafeSourceFetcher($dns, $transport))->fetch($url);
    }

    public static function blockedUrls(): array
    {
        return array_map(fn ($u) => [$u], [
            'http://man.openbsd.org/sshd', 'file:///etc/passwd', 'https://127.0.0.1', 'https://169.254.169.254/latest/meta-data',
            'https://[::1]/', 'https://man.openbsd.org.evil.test/', 'https://user:pass@man.openbsd.org/sshd',
            'https://man.openbsd.org:8443/sshd', 'https://man.openbsd.org/sshd?url=http://localhost',
            'https://man.openbsd.org/sshd#fragment', 'https://2130706433/',
        ]);
    }

    #[DataProvider('privateAddresses')]
    public function test_public_hostname_resolving_to_private_or_mixed_addresses_is_blocked(array $ips): void
    {
        $dns = \Mockery::mock(PublicDns::class)->makePartial();
        $dns->shouldReceive('addresses')->with('man.openbsd.org')->once()->andReturn($ips);
        $this->expectException(AgentException::class);
        $dns->pin('man.openbsd.org');
    }

    public static function privateAddresses(): array
    {
        return [[['127.0.0.1']], [['10.0.0.1']], [['169.254.169.254']], [['100.64.0.1']], [['::1']],
            [['fc00::1']], [['::ffff:127.0.0.1']], [['64:ff9b::7f00:1']], [['2002:7f00:1::']],
            [['2001:0:4136:e378::']], [['93.184.216.34', '192.168.0.1']], [[]]];
    }

    public function test_valid_source_uses_pinned_address_and_discards_scripts_and_navigation(): void
    {
        $dns = $this->mock(PublicDns::class, fn ($m) => $m->shouldReceive('pin')->with('man.openbsd.org')->once()->andReturn('93.184.216.34'));
        $body = '<html><head><title>Manual</title><meta property="article:published_time" content="2026-01-01"></head><body><nav>NOISE</nav><script>INJECTED</script><main>'.F::example()['sources'][0]['text'].'</main></body></html>';
        $transport = $this->mock(SourceTransport::class, fn ($m) => $m->shouldReceive('get')->with('https://man.openbsd.org/sshd', 'man.openbsd.org', '93.184.216.34')->once()->andReturn(['type' => 'text/html', 'body' => $body]));
        $source = (new SafeSourceFetcher($dns, $transport))->fetch('https://man.openbsd.org/sshd');
        $this->assertStringNotContainsString('INJECTED', $source['text']);
        $this->assertStringNotContainsString('NOISE', $source['text']);
        $this->assertSame('2026-01-01', $source['published_at']);
        $this->assertSame(hash('sha256', $source['text']), $source['sha256']);
    }

    #[DataProvider('invalidBodies')]
    public function test_oversize_unsupported_or_empty_sources_are_rejected(string $type, string $body, string $reason): void
    {
        $dns = $this->mock(PublicDns::class, fn ($m) => $m->shouldReceive('pin')->andReturn('93.184.216.34'));
        $transport = $this->mock(SourceTransport::class, fn ($m) => $m->shouldReceive('get')->andReturn(['type' => $type, 'body' => $body]));
        $this->expectExceptionMessage($reason);
        (new SafeSourceFetcher($dns, $transport))->fetch('https://man.openbsd.org/sshd');
    }

    public static function invalidBodies(): array
    {
        return [['application/pdf', 'pdf', 'source_type_unsupported'], ['text/plain', 'Small error', 'source_insufficient_text'],
            ['text/plain', str_repeat('x', 524289), 'source_too_large']];
    }

    public function test_fetching_today_does_not_make_undated_news_fresh(): void
    {
        $sources = F::example()['sources'];
        $fetcher = $this->mock(SafeSourceFetcher::class, function ($m) use ($sources) {
            foreach ($sources as $source) {
                $m->shouldReceive('fetch')->with($source['url'])->andReturn($source);
            }
        });
        $this->expectExceptionMessage('research_fresh_evidence_required');
        (new ResearchService($fetcher))->collect(['sources' => array_column($sources, 'url'), 'time_sensitive' => true, 'outdated' => false]);
    }

    public function test_mirrored_sources_do_not_count_twice(): void
    {
        $source = F::example()['sources'][0];
        $fetcher = $this->mock(SafeSourceFetcher::class, fn ($m) => $m->shouldReceive('fetch')->andReturn($source));
        $this->expectExceptionMessage('research_insufficient_sources');
        (new ResearchService($fetcher))->collect(['sources' => ['https://man.openbsd.org/a', 'https://man.openbsd.org/b'], 'time_sensitive' => false, 'outdated' => false]);
    }
}
