<?php

namespace Tests\Feature;

use App\Services\BlogAgent\EvidenceCatalog;
use App\Services\BlogAgent\GroqClient;
use App\Services\BlogAgent\Prompts;
use App\Services\BlogAgent\QualityGate;
use App\Services\BlogAgent\Schemas;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\BlogAgentFixtures as F;
use Tests\TestCase;

class BlogAgentEvidenceTest extends TestCase
{
    public function test_passages_preserve_all_source_text_and_quote_boundaries(): void
    {
        $catalog = new EvidenceCatalog;
        foreach ([str_repeat("Learning k\u{2011}fold CV — exact text. ", 100).' tail', str_repeat('x', 2010)] as $text) {
            $sources = [['id' => 'S1', 'text' => $text]];
            $passages = $catalog->build($sources);
            $this->assertSame($text, implode('', array_column($passages, 'quote')));
            foreach ($passages as $passage) {
                $this->assertSame('S1', $passage['source_id']);
                $this->assertStringContainsString($passage['quote'], $text);
                $this->assertGreaterThanOrEqual(20, mb_strlen(trim($passage['quote'])));
                $this->assertLessThanOrEqual(1200, mb_strlen(trim($passage['quote'])));
            }
        }
    }

    #[DataProvider('models')]
    public function test_model_selects_ids_and_application_supplies_verbatim_evidence(string $model): void
    {
        config(['blog_agent.api_key' => 'TEST_ONLY', 'blog_agent.api_url' => 'https://api.groq.com/openai/v1/chat/completions', 'blog_agent.model' => $model]);
        Http::preventStrayRequests();
        $f = F::example();
        $wire = $f['draft'];
        foreach ($wire['blocks'] as $i => &$block) {
            $block['evidence'] = [['excerpt_id' => $i === 0 ? 'S1:P1' : 'S2:P1']];
        }
        unset($block);
        Http::fake(['api.groq.com/*' => Http::response(['choices' => [['finish_reason' => 'stop', 'message' => ['content' => json_encode($wire)]]]])]);
        $draft = app(GroqClient::class)->json('draft', app(Prompts::class)->for('draft', 'ai_ml'), ['sources' => $f['sources']]);
        $this->assertSame(['source_id' => 'S1', 'quote' => $f['sources'][0]['text']], $draft['blocks'][0]['evidence'][0]);
        $this->assertTrue(Schemas::valid($draft, Schemas::get('draft')));
        $this->assertSame([], app(QualityGate::class)->validate($draft, $f['sources'], $f['topic'])['evidence_errors']);
        Http::assertSent(function ($request) use ($f) {
            $data = json_decode($request['messages'][1]['content'], true);

            return ! isset($data['sources'][0]['text']) && $data['sources'][0]['passages'][0] === ['id' => 'S1:P1', 'text' => $f['sources'][0]['text']];
        });
        Http::assertSentCount(1);
    }

    public static function models(): array
    {
        return [['openai/gpt-oss-120b'], ['test-json-mode-model']];
    }

    public function test_unknown_ids_cannot_create_valid_evidence_or_spoof_a_source(): void
    {
        $f = F::example();
        $wire = $f['draft'];
        foreach ($wire['blocks'] as &$block) {
            $block['evidence'] = [['excerpt_id' => 'S99:P1']];
        }
        unset($block);
        $catalog = new EvidenceCatalog;
        $resolved = $catalog->resolve($wire, $catalog->build($f['sources']));
        $gate = app(QualityGate::class)->validate($resolved, $f['sources'], $f['topic']);
        $this->assertContains('block_0_evidence_invalid', $gate['issues']);
        $this->assertContains('article_insufficient_evidence', $gate['issues']);
        $wire['blocks'][0]['evidence'][0]['quote'] = $f['sources'][0]['text'];
        $this->assertFalse(Schemas::valid($wire, Schemas::draftReferences()));
    }

    public function test_real_passage_ids_do_not_override_failed_semantic_review(): void
    {
        $f = F::example();
        $catalog = new EvidenceCatalog;
        $wire = $f['draft'];
        foreach ($wire['blocks'] as $i => &$block) {
            $block['evidence'] = [['excerpt_id' => $i === 0 ? 'S1:P1' : 'S2:P1']];
        }
        unset($block);
        $wire['blocks'][0]['text'] = 'Cross-validation guarantees that overfitting and all possible data leakage are eliminated.';
        $review = F::review();
        $review['checks']['factual_support'] = false;
        $review['blocks'][0]['supported'] = false;
        $gate = app(QualityGate::class)->validate($catalog->resolve($wire, $catalog->build($f['sources'])), $f['sources'], $f['topic'], $review);
        $this->assertSame([], $gate['evidence_errors']);
        $this->assertContains('review_factual_support', $gate['issues']);
        $this->assertContains('review_block_0_unsupported_or_unsafe', $gate['issues']);
    }

    public function test_review_receives_all_passage_text_once_with_compact_references(): void
    {
        config(['blog_agent.api_key' => 'TEST_ONLY', 'blog_agent.api_url' => 'https://api.groq.com/openai/v1/chat/completions', 'blog_agent.model' => 'openai/gpt-oss-120b']);
        Http::preventStrayRequests();
        $f = F::example();
        $catalog = new EvidenceCatalog;
        $draft = $f['draft'];
        $passages = $catalog->build($f['sources']);
        foreach ($draft['blocks'] as &$block) {
            $block['evidence'] = [$passages['S1:P1'], $passages['S2:P1']];
        }
        unset($block);
        Http::fake(['api.groq.com/*' => Http::response(F::response(F::review()))]);
        $this->assertSame(F::review(), app(GroqClient::class)->json('review', 'Review all supplied passage text.', ['sources' => $f['sources'], 'draft' => $draft]));
        Http::assertSent(function ($request) use ($f) {
            $data = json_decode($request['messages'][1]['content'], true);

            return $data['draft']['blocks'][0]['evidence'] === [['excerpt_id' => 'S1:P1'], ['excerpt_id' => 'S2:P1']]
                && $data['sources'][0]['passages'][0]['text'] === $f['sources'][0]['text']
                && ! isset($data['sources'][0]['text']);
        });
    }
}
