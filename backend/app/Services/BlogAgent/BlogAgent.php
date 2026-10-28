<?php

namespace App\Services\BlogAgent;

use App\Models\Blog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BlogAgent
{
    public function __construct(
        private TopicSelector $topics,
        private ResearchService $research,
        private GroqClient $client,
        private Prompts $prompts,
        private QualityGate $quality,
        private ArticleRenderer $renderer,
    ) {}

    public function run(?string $manual, array $urls, bool $dryRun, bool $forceDraft): array
    {
        $this->client->ready();
        $topic = $this->topics->select($manual, $urls);
        $sources = $this->research->collect($topic);
        $context = ['topic' => $topic, 'sources' => $sources];
        $plan = $this->client->json('plan', $this->prompts->for('plan', $topic['category']), $context);
        if (! $plan['can_write'] || ! $plan['headings'] || count(array_unique($plan['source_ids'])) < 2 || array_diff($plan['source_ids'], array_column($sources, 'id'))) {
            throw new AgentException('research_plan_rejected');
        }
        $context['plan'] = $plan;
        $draft = $this->client->json('draft', $this->prompts->for('draft', $topic['category']), $context);
        $maxRevisions = min(1, max(0, (int) config('blog_agent.max_revisions')));
        $maxEvidenceRepairs = $maxRevisions === 0 ? 0 : min(1, max(0, (int) config('blog_agent.max_evidence_repairs', 1)));
        $revision = 0;
        $evidenceRepairs = 0;
        $editorialFeedback = [];
        while (true) {
            $gate = $this->quality->validate($draft, $sources, $topic);
            $review = null;
            if (! $gate['issues']) {
                $review = $this->client->json('review', $this->prompts->for('review', $topic['category']), $context + ['draft' => $draft]);
                $gate = $this->quality->validate($draft, $sources, $topic, $review);
                $editorialFeedback = $review['issues'];
            }
            if (! $gate['issues']) {
                break;
            }
            // A quote-copy repair must not spend the only opportunity to act on
            // later editorial feedback. Each budget is hard-capped at one.
            $hasEvidenceIssues = (bool) array_filter($gate['issues'], fn ($issue) => preg_match('/^block_\d+_evidence_(invalid|missing)$/', $issue) || $issue === 'article_insufficient_evidence');
            if ($hasEvidenceIssues) {
                if ($evidenceRepairs >= $maxEvidenceRepairs) {
                    break;
                }
                $evidenceRepairs++;
            } else {
                if ($revision >= $maxRevisions) {
                    break;
                }
                $revision++;
            }
            $draft = $this->client->json('draft', $this->prompts->for('draft', $topic['category']), $context + [
                'previous_draft' => $draft, 'revision_feedback' => $gate['issues'], 'editorial_feedback' => $editorialFeedback,
                'evidence_feedback' => $gate['evidence_errors'] ?? [],
                'repair_type' => $hasEvidenceIssues ? 'evidence' : 'content',
            ]);
        }
        $report = ['topic' => $topic, 'model' => config('blog_agent.model'), 'sources' => $sources, 'plan' => $plan,
            'draft' => $draft, 'review' => $review, 'gate' => $gate, 'revisions' => $revision + $evidenceRepairs,
            'content_revisions' => $revision, 'evidence_repairs' => $evidenceRepairs, 'created_at' => now()->toIso8601String()];
        if ($gate['issues']) {
            $reportPath = null;
            if (! $dryRun) {
                $reportPath = 'reports/rejected-'.$topic['key'].'-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(6)).'.json';
                $report['outcome'] = 'rejected';
                if (! Storage::disk('blog_research')->put($reportPath, json_encode($report, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT))) {
                    throw new AgentException('rejection_audit_save_failed');
                }
            }
            throw new AgentException('quality_rejected:'.implode(',', $gate['issues']), $reportPath);
        }
        if ($this->topics->duplicate($draft['title'])) {
            throw new AgentException('article_duplicate');
        }
        $status = config('blog_agent.auto_publish') && ! $forceDraft && ! $gate['requires_human_review'] ? 'published' : 'draft';
        $result = [
            'title' => trim($draft['title']), 'slug' => $topic['key'], 'excerpt' => trim($draft['excerpt']),
            'content' => $this->renderer->markdown($draft, $sources), 'cover_image' => $this->renderer->cover($topic['category']),
            'status' => $status, 'coming_soon' => false, 'published_at' => $status === 'published' ? now() : null,
        ];
        if ($dryRun) {
            return ['dry_run' => true, 'would_save_as' => $status, 'article' => $result, 'requires_human_review' => $gate['requires_human_review']];
        }
        // Save a private audit before allowing any article to be published.
        $report['outcome'] = $status;
        $reportPath = 'reports/'.$topic['key'].'.json';
        if (! Storage::disk('blog_research')->put($reportPath, json_encode($report, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT))) {
            throw new AgentException('audit_save_failed');
        }
        $blog = DB::transaction(function () use ($topic, $result) {
            if ($this->topics->duplicate($result['title'], $topic['key'])) {
                throw new AgentException('article_duplicate');
            }

            return Blog::create($result);
        });

        return ['id' => $blog->id, 'status' => $blog->status, 'report' => $reportPath, 'requires_human_review' => $gate['requires_human_review']];
    }
}
