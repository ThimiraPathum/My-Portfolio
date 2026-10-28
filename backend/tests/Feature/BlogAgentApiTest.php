<?php

namespace Tests\Feature;

use App\Services\BlogAgent\AgentException;
use App\Services\BlogAgent\GroqClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\BlogAgentFixtures as F;
use Tests\TestCase;

class BlogAgentApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['blog_agent.api_key' => 'gsk_TEST_SECRET', 'blog_agent.api_url' => 'https://api.groq.com/openai/v1/chat/completions',
            'blog_agent.model' => 'openai/gpt-oss-120b', 'blog_agent.retry_delay' => 0]);
        Http::preventStrayRequests();
        Sleep::fake();
    }

    public function test_rate_limit_retries_are_bounded_and_success_uses_configured_model(): void
    {
        Http::fake(['api.groq.com/*' => Http::sequence()->push([], 429, ['Retry-After' => '0'])
            ->push([], 503)->push(F::response(F::plan()))]);
        $this->assertSame(F::plan(), app(GroqClient::class)->json('plan', 'JSON', []));
        Http::assertSentCount(3);
        Http::assertSent(fn ($r) => $r['model'] === 'openai/gpt-oss-120b' && $r['response_format']['json_schema']['strict'] === true);
    }

    public function test_daily_rate_limit_does_not_sleep_or_retry_early(): void
    {
        Http::fake(['api.groq.com/*' => Http::response([], 429, ['Retry-After' => '3600'])]);
        try {
            app(GroqClient::class)->json('plan', 'JSON', []);
            $this->fail('Long rate limit accepted');
        } catch (AgentException $e) {
            $this->assertSame('api_retry_later', $e->reason);
        }
        Http::assertSentCount(1);
    }

    public function test_continuous_rate_limit_stops_after_three_requests(): void
    {
        Http::fake(['api.groq.com/*' => Http::response([], 429)]);
        try {
            app(GroqClient::class)->json('plan', 'JSON', []);
            $this->fail('Rate limit accepted');
        } catch (AgentException $e) {
            $this->assertSame('api_rate_limited', $e->reason);
        }
        Http::assertSentCount(3);
        Sleep::assertSequence([Sleep::for(60)->seconds(), Sleep::for(60)->seconds()]);
    }

    public function test_token_reset_header_is_used_without_retry_after(): void
    {
        Http::fake(['api.groq.com/*' => Http::sequence()
            ->push([], 429, ['x-ratelimit-reset-tokens' => '7.66s'])
            ->push(F::response(F::plan()))]);
        $this->assertSame(F::plan(), app(GroqClient::class)->json('plan', 'JSON', []));
        Sleep::assertSequence([Sleep::for(8)->seconds()]);
        Http::assertSentCount(2);
    }

    public function test_successful_response_paces_the_next_stage(): void
    {
        Http::fake(['api.groq.com/*' => Http::sequence()
            ->push(F::response(F::plan()), 200, ['x-ratelimit-remaining-tokens' => '10', 'x-ratelimit-reset-tokens' => '1m0s'])
            ->push(F::response(F::plan()))]);
        $client = app(GroqClient::class);
        $client->json('plan', 'JSON', []);
        $this->assertSame(F::plan(), $client->json('plan', 'JSON', []));
        Sleep::assertSequence([Sleep::for(60)->seconds()]);
        Http::assertSentCount(2);
    }

    public function test_daily_exhaustion_returns_only_safe_stage_and_quota_details(): void
    {
        Http::fake(['api.groq.com/*' => Http::response(['error' => ['message' => 'gsk_TEST_SECRET']], 429, [
            'x-ratelimit-remaining-requests' => '0', 'x-ratelimit-reset-requests' => '2h3m4s',
            'x-ratelimit-remaining-tokens' => 'gsk_TEST_SECRET',
        ])]);
        try {
            app(GroqClient::class)->json('review', 'JSON', []);
            $this->fail('Daily exhaustion accepted');
        } catch (AgentException $e) {
            $this->assertSame('api_daily_request_limit', $e->reason);
            $this->assertSame('review', $e->diagnostics['stage']);
            $this->assertSame(7384, $e->diagnostics['reset_requests_seconds']);
            $this->assertStringNotContainsString('gsk_TEST_SECRET', json_encode($e->diagnostics));
        }
        Sleep::assertNeverSlept();
        Http::assertSentCount(1);
    }

    public function test_long_token_reset_stops_instead_of_retrying_early(): void
    {
        Http::fake(['api.groq.com/*' => Http::response([], 429, ['x-ratelimit-reset-tokens' => '1m12s'])]);
        try {
            app(GroqClient::class)->json('plan', 'JSON', []);
            $this->fail('Long reset accepted');
        } catch (AgentException $e) {
            $this->assertSame('api_retry_later', $e->reason);
            $this->assertSame(72, $e->diagnostics['wait_seconds']);
        }
        Sleep::assertNeverSlept();
        Http::assertSentCount(1);
    }

    #[DataProvider('failures')]
    public function test_provider_failures_are_safe_and_never_echo_raw_errors(int $status, array $body, string $expected): void
    {
        Http::fake(['api.groq.com/*' => Http::response($body, $status)]);
        try {
            app(GroqClient::class)->json('plan', 'JSON', []);
            $this->fail('Invalid API result accepted');
        } catch (AgentException $e) {
            $this->assertSame($expected, $e->reason);
            $this->assertStringNotContainsString('gsk_TEST_SECRET', $e->getMessage());
        }
        Http::assertSentCount(1);
    }

    public static function failures(): array
    {
        return [
            'revoked' => [401, ['error' => ['message' => 'secret gsk_TEST_SECRET']], 'api_key_invalid_or_revoked'],
            'model retired' => [400, ['error' => ['code' => 'model_decommissioned']], 'api_model_unavailable'],
            'model absent' => [404, [], 'api_model_unavailable'],
            'bad JSON' => [200, ['choices' => [['finish_reason' => 'stop', 'message' => ['content' => '{broken']]]], 'api_invalid_json'],
            'partial JSON' => [200, F::response(['angle' => 'Incomplete']), 'api_schema_invalid'],
            'truncated' => [200, ['choices' => [['finish_reason' => 'length', 'message' => ['content' => '{}']]]], 'api_incomplete_response'],
            'refusal' => [200, ['choices' => [['finish_reason' => 'stop', 'message' => ['content' => null]]]], 'api_invalid_json'],
        ];
    }

    public function test_connection_failure_has_bounded_retries(): void
    {
        $attempts = 0;
        Http::fake(function () use (&$attempts) {
            $attempts++;
            throw new ConnectionException('request contained gsk_TEST_SECRET');
        });
        try {
            app(GroqClient::class)->json('plan', 'JSON', []);
            $this->fail('Connection failure accepted');
        } catch (AgentException $e) {
            $this->assertSame('api_connection_failed', $e->reason);
        }
        $this->assertSame(3, $attempts);
    }

    public function test_oversized_context_is_rejected_before_a_provider_request(): void
    {
        try {
            app(GroqClient::class)->json('review', 'JSON', ['draft' => str_repeat('long text ', 5000)]);
            $this->fail('Oversized context sent');
        } catch (AgentException $e) {
            $this->assertSame('api_context_budget_exceeded', $e->reason);
        }
        Http::assertNothingSent();
    }
}
