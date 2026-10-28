<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Services\BlogAgent\AgentException;
use App\Services\BlogAgent\BlogAgent;
use App\Services\BlogAgent\PublicDns;
use App\Services\BlogAgent\SourceTransport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\Support\BlogAgentFixtures as F;
use Tests\TestCase;

class BlogAgentTest extends TestCase
{
    use RefreshDatabase;

    protected array $fixture;

    protected function setUp(): void
    {
        parent::setUp();
        config(['blog_agent.api_key' => 'gsk_TEST_NOT_A_REAL_KEY', 'blog_agent.api_url' => 'https://api.groq.com/openai/v1/chat/completions',
            'blog_agent.model' => 'openai/gpt-oss-120b', 'blog_agent.auto_publish' => false, 'blog_agent.retry_delay' => 0,
            'blog_agent.max_revisions' => 1, 'blog_agent.lock_store' => 'array']);
        Http::preventStrayRequests();
        Storage::fake('blog_research');
        $this->researchFixture();
    }

    private function researchFixture(string $category = 'ai_ml'): void
    {
        $this->fixture = F::example($category);
        $this->mock(PublicDns::class, fn ($m) => $m->shouldReceive('pin')->andReturn('93.184.216.34'));
        $sources = $this->fixture['sources'];
        $this->mock(SourceTransport::class, fn ($m) => $m->shouldReceive('get')->andReturnUsing(function ($url) use ($sources) {
            $source = collect($sources)->firstWhere('url', $url);
            if (! $source) {
                throw new AgentException('source_unavailable');
            }

            return ['type' => 'text/plain', 'body' => $source['text']];
        }));
    }

    private function responses(?array $draft = null, ?array $review = null): void
    {
        Http::fake(['api.groq.com/*' => Http::sequence()
            ->push(F::response(F::plan()))
            ->push(F::response($draft ?? $this->fixture['draft']))
            ->push(F::response($review ?? F::review()))]);
    }

    private function runAgent(bool $dryRun = false, bool $forceDraft = false): array
    {
        return app(BlogAgent::class)->run($this->fixture['topic']['title'], array_column($this->fixture['sources'], 'url'), $dryRun, $forceDraft);
    }

    public function test_success_defaults_to_private_draft_with_retrieved_citations_and_audit(): void
    {
        $this->responses();
        $result = $this->runAgent();
        $blog = Blog::findOrFail($result['id']);
        $this->assertSame('draft', $blog->status);
        $this->assertFalse($blog->coming_soon);
        $this->assertNull($blog->published_at);
        $this->assertStringContainsString('[S1]', $blog->content);
        $this->assertStringNotContainsString('picsum', $blog->cover_image);
        Storage::disk('blog_research')->assertExists($result['report']);
        $this->getJson('/api/blogs/'.$blog->slug)->assertNotFound();
        $this->getJson('/api/blogs')->assertJsonCount(0);
        Http::assertSentCount(3);
    }

    public function test_auto_publish_requires_every_gate_and_preserves_old_posts(): void
    {
        $existing = Blog::create(['title' => 'Earlier article', 'content' => 'Original body', 'status' => 'published', 'cover_image' => '/old.jpg']);
        config(['blog_agent.auto_publish' => true]);
        $this->responses();
        $result = $this->runAgent();
        $this->assertSame('published', $result['status']);
        $this->assertNotNull(Blog::find($result['id'])->published_at);
        $this->assertSame('Original body', $existing->fresh()->content);
        $this->assertSame('/old.jpg', $existing->fresh()->cover_image);
    }

    public function test_explicit_draft_overrides_auto_publish(): void
    {
        config(['blog_agent.auto_publish' => true]);
        $this->responses();
        $this->assertSame('draft', $this->runAgent(false, true)['status']);
    }

    public function test_security_operational_advice_stays_draft_even_when_model_approves(): void
    {
        config(['blog_agent.auto_publish' => true]);
        $this->researchFixture('cybersecurity');
        $this->responses();
        $result = $this->runAgent();
        $this->assertSame('draft', $result['status']);
        $this->assertTrue($result['requires_human_review']);
    }

    public function test_dry_run_writes_neither_article_nor_evidence_report(): void
    {
        config(['blog_agent.auto_publish' => true]);
        $this->responses();
        $this->assertTrue($this->runAgent(true)['dry_run']);
        $this->assertDatabaseCount('blogs', 0);
        $this->assertSame([], Storage::disk('blog_research')->allFiles());
    }

    public function test_repeating_same_topic_cannot_create_duplicate_draft_or_call_api_again(): void
    {
        $this->responses();
        $this->runAgent();
        try {
            $this->runAgent();
            $this->fail('Duplicate accepted');
        } catch (AgentException $e) {
            $this->assertSame('topic_duplicate', $e->reason);
        }
        $this->assertDatabaseCount('blogs', 1);
        Http::assertSentCount(3);
    }

    public function test_one_revision_fixes_unsupported_statistic_before_review(): void
    {
        $bad = $this->fixture['draft'];
        $bad['blocks'][0]['text'] .= ' Acme Corp improved performance by 97%.';
        Http::fake(['api.groq.com/*' => Http::sequence()->push(F::response(F::plan()))
            ->push(F::response($bad))->push(F::response($this->fixture['draft']))->push(F::response(F::review()))]);
        $this->runAgent();
        $this->assertDatabaseCount('blogs', 1);
        Http::assertSentCount(4);
    }

    public function test_persistent_quality_failure_is_rejected_after_one_revision(): void
    {
        $bad = $this->fixture['draft'];
        $bad['blocks'][0]['evidence'][0]['source_id'] = 'S99';
        Http::fake(['api.groq.com/*' => Http::sequence()->push(F::response(F::plan()))->push(F::response($bad))->push(F::response($bad))]);
        try {
            $this->runAgent();
            $this->fail('Fabricated source accepted');
        } catch (AgentException $e) {
            $this->assertStringContainsString('evidence_invalid', $e->reason);
        }
        $this->assertDatabaseCount('blogs', 0);
        Http::assertSentCount(3);
    }

    public function test_critical_editorial_failure_cannot_be_outvoted_by_other_passing_checks(): void
    {
        config(['blog_agent.auto_publish' => true, 'blog_agent.max_revisions' => 0]);
        $review = F::review();
        $review['checks']['factual_support'] = false;
        $review['blocks'][0]['supported'] = false;
        $this->responses(review: $review);
        try {
            $this->runAgent();
            $this->fail('Unsupported claim published');
        } catch (AgentException $e) {
            $this->assertStringContainsString('review_factual_support', $e->reason);
        }
        $this->assertDatabaseCount('blogs', 0);
    }

    public function test_unavailable_research_stops_before_generation(): void
    {
        $this->mock(SourceTransport::class, fn ($m) => $m->shouldReceive('get')->andThrow(new AgentException('source_unavailable')));
        try {
            $this->runAgent();
            $this->fail('Unresearched article accepted');
        } catch (AgentException $e) {
            $this->assertStringStartsWith('research_insufficient_sources', $e->reason);
        }
        Http::assertNothingSent();
        $this->assertDatabaseCount('blogs', 0);
    }

    public function test_missing_credentials_fail_without_network_calls_and_without_exposing_values(): void
    {
        config(['blog_agent.api_key' => null]);
        $this->artisan('blog:generate --dry-run')->expectsOutput('Blog generation stopped: api_credentials_missing')->assertFailed();
        Http::assertNothingSent();
        $this->assertDatabaseCount('blogs', 0);
    }

    public function test_manual_source_free_unknown_topic_is_honestly_rejected(): void
    {
        $this->expectExceptionMessage('research_insufficient_sources');
        app(BlogAgent::class)->run('An obscure film without available source material', [], true, false);
    }
}
