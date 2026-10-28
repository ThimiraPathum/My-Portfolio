<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Services\BlogAgent\Prompts;
use App\Services\BlogAgent\QualityGate;
use App\Services\BlogAgent\TopicSelector;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\BlogAgentFixtures as F;
use Tests\TestCase;

class BlogAgentQualityTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('badDrafts')]
    public function test_deterministic_gate_blocks_known_failures(string $mutation, string $issue): void
    {
        $f = F::example();
        $d = $f['draft'];
        switch ($mutation) {
            case 'statistics': $d['blocks'][0]['text'] .= ' Acme Corp reduced attacks by 97%.';
                break;
            case 'citation': $d['blocks'][0]['evidence'][0]['source_id'] = 'S99';
                break;
            case 'invented quote': $d['blocks'][0]['evidence'][0]['quote'] = 'A made up quotation never present in the retrieved source.';
                break;
            case 'unsafe': $d['blocks'][0]['text'] .= ' Set PermitRootLogin yes.';
                break;
            case 'markdown': $d['blocks'][0]['text'] .= "\n```bashCopy\necho x";
                break;
            case 'link': $d['blocks'][0]['text'] .= ' See https://invented.example/fake-paper';
                break;
            case 'repetition': $d['blocks'][1] = $d['blocks'][0];
                break;
            case 'empty': $d['blocks'] = [];
                break;
            case 'table': $d['blocks'][0]['text'] .= "\n| Broken | table |\n| No | separator |";
                break;
        }
        $result = app(QualityGate::class)->validate($d, $f['sources'], $f['topic'], F::review());
        $this->assertContains($issue, $result['issues']);
    }

    public static function badDrafts(): array
    {
        return [
            ['statistics', 'block_0_numeric_claim_unsupported'], ['citation', 'block_0_evidence_invalid'],
            ['invented quote', 'block_0_evidence_invalid'], ['unsafe', 'unsafe_configuration'],
            ['markdown', 'markdown_invalid'], ['link', 'article_unverified_link'],
            ['repetition', 'article_repetition'], ['empty', 'article_depth'], ['table', 'markdown_broken_table'],
        ];
    }

    public function test_quote_copy_errors_have_precise_feedback_and_still_fail(): void
    {
        $f = F::example();
        $original = 'Learning the parameters of a prediction function and testing it on the same data is a methodological mistake.';
        $f['sources'][0]['text'] = $original.' In k-fold CV, the training set is split into k smaller sets.';
        foreach ([
            ['source_id' => 'S1', 'quote' => lcfirst($original), 'reason' => 'quote_not_verbatim'],
            ['source_id' => 'S1', 'quote' => 'Learning the parameters ... is a methodological mistake.', 'reason' => 'quote_not_verbatim'],
            ['source_id' => 'S1', 'quote' => "In k\u{2011}fold CV, the training set is split into k smaller sets.", 'reason' => 'quote_not_verbatim'],
            ['source_id' => 'S99', 'quote' => $original, 'reason' => 'source_id_unknown'],
            ['source_id' => 'S1', 'quote' => 'Learning', 'reason' => 'quote_length_out_of_range'],
        ] as $case) {
            $f['draft']['blocks'][0]['evidence'] = [['source_id' => $case['source_id'], 'quote' => $case['quote']]];
            $gate = app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic']);
            $this->assertContains('block_0_evidence_invalid', $gate['issues']);
            $this->assertSame(['block_index' => 0, 'evidence_index' => 0, 'source_id' => $case['source_id'],
                'quote' => $case['quote'], 'reason' => $case['reason']], $gate['evidence_errors'][0]);
        }
        $f['draft']['blocks'][0]['evidence'] = [['source_id' => 'S1', 'quote' => $original]];
        $gate = app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic']);
        $this->assertNotContains('block_0_evidence_invalid', $gate['issues']);
    }

    public function test_wrong_film_credits_and_unsupported_animation_claims_are_rejected_by_evidence_and_review(): void
    {
        $f = F::example('film_tv');
        foreach (['Past Lives was shot by Roger Deakins.', 'Cyberpunk: Edgerunners is a 3D animation production.'] as $claim) {
            $d = $f['draft'];
            $d['blocks'][0]['text'] = $claim.' This factual statement needs evidence before publication.';
            $d['blocks'][0]['evidence'][0]['quote'] = $claim;
            $review = F::review();
            $review['checks']['factual_support'] = false;
            $review['blocks'][0]['supported'] = false;
            $result = app(QualityGate::class)->validate($d, $f['sources'], $f['topic'], $review);
            $this->assertContains('block_0_evidence_invalid', $result['issues']);
            $this->assertContains('review_factual_support', $result['issues']);
        }
    }

    public function test_real_quote_does_not_override_failed_semantic_review_of_false_paraphrase(): void
    {
        $f = F::example('film_tv');
        $f['draft']['blocks'][1]['text'] = 'The cinematographer is Roger Deakins. The writing and direction credits should be distinguished from photography credits in any discussion of production work.';
        $review = F::review();
        $review['blocks'][1]['supported'] = false;
        $result = app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic'], $review);
        $this->assertContains('review_block_1_unsupported_or_unsafe', $result['issues']);
    }

    public function test_review_must_cover_every_block_exactly_once(): void
    {
        $f = F::example();
        $r = F::review();
        $r['blocks'][2]['index'] = 1;
        $this->assertContains('review_incomplete', app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic'], $r)['issues']);
    }

    public function test_time_sensitive_claims_in_an_evergreen_draft_still_require_fresh_evidence(): void
    {
        $f = F::example();
        $f['draft']['blocks'][0]['text'] .= ' The latest release changes the default behaviour.';
        $result = app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic'], F::review());
        $this->assertContains('article_fresh_evidence_required', $result['issues']);
    }

    public function test_category_styles_and_simulated_examples_are_distinct_and_valid(): void
    {
        foreach (['cybersecurity', 'ai_ml', 'film_tv'] as $category) {
            $f = F::example($category);
            $this->assertSame([], app(QualityGate::class)->validate($f['draft'], $f['sources'], $f['topic'], F::review())['issues']);
        }
        $p = app(Prompts::class);
        $this->assertStringContainsString('spoiler-free', $p->for('draft', 'film_tv'));
        $this->assertStringContainsString('mathematical intuition', $p->for('draft', 'ai_ml'));
        $this->assertStringContainsString('recovery path', $p->for('draft', 'cybersecurity'));
    }

    public function test_near_duplicate_and_outdated_titles_are_detected(): void
    {
        Blog::create(['title' => 'Cross-validation: keep preprocessing inside the training fold', 'content' => 'Existing', 'status' => 'draft']);
        $selector = app(TopicSelector::class);
        $this->assertTrue($selector->duplicate('Keep preprocessing inside training folds: cross-validation'));
        $old = $selector->select('Upcoming games in 2021');
        $this->assertTrue($old['time_sensitive']);
        $this->assertTrue((bool) $old['outdated']);
    }
}
