<?php

namespace App\Services\BlogAgent;

class ResearchService
{
    public function __construct(private SafeSourceFetcher $fetcher) {}

    public function collect(array $topic): array
    {
        if ($topic['outdated']) {
            throw new AgentException('topic_outdated_review_required');
        }
        $sources = [];
        $failures = [];
        foreach (array_slice(array_unique($topic['sources']), 0, min(5, config('blog_agent.max_sources'))) as $url) {
            try {
                $source = $this->fetcher->fetch($url);
                // Mirrored pages do not count as additional evidence.
                if (in_array($source['sha256'], array_column($sources, 'sha256'), true)) {
                    continue;
                }
                $source['id'] = 'S'.(count($sources) + 1);
                $sources[] = $source;
            } catch (AgentException $e) {
                // Fail closed below; never substitute LLM memory for retrieval.
                $failures[] = $e->reason;
            }
        }
        if (count($sources) < max(2, config('blog_agent.min_sources'))) {
            throw new AgentException('research_insufficient_sources'.($failures ? ':'.implode(',', array_unique($failures)) : ''));
        }
        if ($topic['time_sensitive']) {
            $fresh = array_filter($sources, fn ($s) => $s['published_at'] && strtotime($s['published_at']) >= now()->subDays(config('blog_agent.fresh_days'))->timestamp);
            if (count($fresh) < 2) {
                throw new AgentException('research_fresh_evidence_required');
            }
        }

        // Bound total research context, not just each fetched document. Keep
        // the full-extraction hash as provenance and hash the exact excerpt sent.
        $perSource = intdiv(min(24000, max(1000, (int) config('blog_agent.research_chars'))), count($sources));
        foreach ($sources as &$source) {
            $source['document_sha256'] = $source['sha256'];
            $source['text'] = mb_substr($source['text'], 0, $perSource);
            $source['sha256'] = hash('sha256', $source['text']);
        }
        unset($source);

        return $sources;
    }
}
