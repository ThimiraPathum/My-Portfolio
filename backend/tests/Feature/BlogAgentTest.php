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
            $this->assertNotNull($e->reportPath);
            Storage::disk('blog_research')->assertExists($e->reportPath);
        }
        $this->assertDatabaseCount('blogs', 0);
        Http::assertSentCount(3);
    }

    public function test_quote_revision_receives_exact_error_and_requires_review_before_save(): void
    {
        $bad = $this->fixture['draft'];
        $bad['blocks'][0]['evidence'][0]['quote'] = 'An abbreviated ... quotation that cannot match the supplied source.';
        Http::fake(['api.groq.com/*' => Http::sequence()->push(F::response(F::plan()))
            ->push(F::response($bad))->push(F::response($this->fixture['draft']))->push(F::response(F::review()))]);
        $result = $this->runAgent();
        $this->assertSame('draft', $result['status']);
        Http::assertSent(function ($request) use ($bad) {
            $data = json_decode($request['messages'][1]['content'], true);

            return ($data['evidence_feedback'][0] ?? null) === [
                'block_index' => 0, 'evidence_index' => 0, 'source_id' => $bad['blocks'][0]['evidence'][0]['source_id'],
                'quote' => $bad['blocks'][0]['evidence'][0]['quote'], 'reason' => 'quote_not_verbatim',
            ];
        });
        Http::assertSentCount(4);
    }

    public function test_old_report_explains_quote_mismatch_using_saved_sources_without_api_calls(): void
    {
        $path = 'reports/rejected-agent-'.str_repeat('a', 32).'-20261028184648-'.str_repeat('b', 12).'.json';
        $draft = $this->fixture['draft'];
        $draft['blocks'][0]['evidence'][0]['quote'] = 'An abbreviated ... quotation that cannot match the supplied source.';
        $review = F::review();
        $review['blocks'][2]['supported'] = false;
        Storage::disk('blog_research')->put($path, json_encode([
            'draft' => $draft, 'sources' => $this->fixture['sources'], 'topic' => $this->fixture['topic'],
            'review' => $review, 'gate' => ['issues' => ['block_0_evidence_invalid']],
        ]));
        $this->assertSame(0, \Illuminate\Support\Facades\Artisan::call('blog:report', ['report' => $path]));
        $output = json_decode(\Illuminate\Support\Facades\Artisan::output(), true, 64, JSON_THROW_ON_ERROR);
        $this->assertSame('quote_not_verbatim', $output['evidence_errors'][0]['reason']);
        $this->assertSame($this->fixture['sources'][0]['text'], $output['evidence_sources'][0]['text']);
        $this->assertSame([1, 3], array_column($output['blocks'], 'number'));
        Http::assertNothingSent();
        $this->assertDatabaseCount('blogs', 0);
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

    public function test_rejected_dry_run_does_not_write_a_report(): void
    {
        config(['blog_agent.max_revisions' => 0]);
        $review = F::review();
        $review['checks']['factual_support'] = false;
        $this->responses(review: $review);
        try {
            $this->runAgent(true);
            $this->fail('Bad dry run accepted');
        } catch (AgentException $e) {
            $this->assertNull($e->reportPath);
        }
        $this->assertSame([], Storage::disk('blog_research')->allFiles());
        $this->assertDatabaseCount('blogs', 0);
    }

    public function test_report_shows_editorial_reason_and_block_without_secret_or_public_post(): void
    {
        config(['blog_agent.max_revisions' => 0]);
        $review = F::review();
        $review['blocks'][2]['supported'] = false;
        $review['issues'] = ['The third block contains an unsupported assertion. gsk_TEST_NOT_A_REAL_KEY'];
        $this->responses(review: $review);
        try {
            $this->runAgent();
        } catch (AgentException $e) {
            $this->assertNotNull($e->reportPath);
        }
        $this->artisan('blog:report')->expectsOutputToContain('unsupported assertion. [REDACTED]')->assertSuccessful();
        $this->assertDatabaseCount('blogs', 0);
        Http::assertSentCount(3);
    }

    public function test_report_rejects_path_traversal(): void
    {
        $this->artisan('blog:report', ['report' => '../../.env'])->assertFailed();
        Http::assertNothingSent();
    }

    public function test_manual_source_free_unknown_topic_is_honestly_rejected(): void
    {
        $this->expectExceptionMessage('research_insufficient_sources');
        app(BlogAgent::class)->run('An obscure film without available source material', [], true, false);
    }
}
