<?php

namespace App\Services\BlogAgent;

class QualityGate
{
    public function validate(array $draft, array $sources, array $topic, ?array $review = null): array
    {
        $issues = [];
        $evidenceErrors = [];
        if (! Schemas::valid($draft, Schemas::get('draft'))) {
            return ['issues' => ['article_schema_invalid'], 'requires_human_review' => true];
        }
        $byId = array_column($sources, null, 'id');
        $used = [];
        $seen = [];
        $all = $draft['title']."\n".$draft['excerpt'];
        if (trim($draft['title']) === '' || mb_strlen($draft['title']) > 220 || trim($draft['excerpt']) === '' || mb_strlen($draft['excerpt']) > 600) {
            $issues[] = 'article_metadata_invalid';
        }
        if (preg_match('/[\r\n<>`#]/', $draft['title'].$draft['excerpt'])) {
            $issues[] = 'article_metadata_invalid';
        }
        if (count($draft['blocks']) < 3 || count($draft['blocks']) > 18) {
            $issues[] = 'article_depth';
        }
        foreach ($draft['blocks'] as $i => $block) {
            $text = trim($block['text']);
            $all .= "\n".$block['heading']."\n".$text;
            if (mb_strlen($text) < 40 || mb_strlen($text) > 5000 || mb_strlen($block['heading']) > 120) {
                $issues[] = "block_{$i}_length";
            }
            if (str_contains($block['heading'], "\n") || preg_match('/[#<>`]/', $block['heading'])) {
                $issues[] = 'markdown_heading';
            }
            if (strcasecmp(trim($block['heading']), trim($draft['title'])) === 0) {
                $issues[] = 'markdown_duplicate_title';
            }
            $normalized = strtolower(preg_replace('/\s+/', ' ', $text));
            foreach ($seen as $previous) {
                similar_text($previous, $normalized, $similarity);
                if ($similarity > 88) {
                    $issues[] = 'article_repetition';
                }
            }
            $seen[] = $normalized;
            if ($block['kind'] !== 'interpretation' && ! $block['evidence']) {
                $issues[] = "block_{$i}_evidence_missing";
            }
            $quotes = '';
            foreach ($block['evidence'] as $evidenceIndex => $evidence) {
                $source = $byId[$evidence['source_id']] ?? null;
                $quote = trim($evidence['quote']);
                if (! $source || mb_strlen($quote) < 20 || mb_strlen($quote) > 1200 || ! str_contains($source['text'], $quote)) {
                    $issues[] = "block_{$i}_evidence_invalid";
                    $evidenceErrors[] = [
                        'block_index' => $i, 'evidence_index' => $evidenceIndex,
                        'source_id' => $evidence['source_id'], 'quote' => $evidence['quote'],
                        'reason' => ! $source ? 'source_id_unknown' :
                            (mb_strlen($quote) < 20 || mb_strlen($quote) > 1200 ? 'quote_length_out_of_range' : 'quote_not_verbatim'),
                    ];

                    continue;
                }
                $quotes .= ' '.$quote;
                $used[$source['id']] = true;
            }
            // Numerical claims require literal supporting evidence, not model confidence.
            preg_match_all('/\b\d+(?:\.\d+)?\s*(?:percent|fps|milliseconds|million|billion)\b|\b\d+(?:\.\d+)?%/i', $text, $numbers);
            foreach ($numbers[0] as $number) {
                if (! str_contains(strtolower($quotes), strtolower($number))) {
                    $issues[] = "block_{$i}_numeric_claim_unsupported";
                }
            }
            $issues = array_merge($issues, $this->markdownIssues($text));
        }
        if (count($used) < max(2, config('blog_agent.min_sources'))) {
            $issues[] = 'article_insufficient_evidence';
        }
        if (mb_strlen($all) < 650) {
            $issues[] = 'article_depth';
        }
        if (preg_match('/\b(upcoming|latest|current version|next release|will be released|will launch|as of 20\d{2})\b/i', $all)) {
            $fresh = array_filter($sources, fn ($source) => ! empty($source['published_at']) &&
                strtotime($source['published_at']) >= now()->subDays(config('blog_agent.fresh_days'))->timestamp);
            if (count($fresh) < 2) {
                $issues[] = 'article_fresh_evidence_required';
            }
        }
        if (preg_match('~https?://|www\.|mailto:|\b[^\s@]+@[^\s@]+\.[a-z]{2,}~i', $all)) {
            $issues[] = 'article_unverified_link';
        }
        if (preg_match('/PermitRootLogin\s+yes|StrictHostKeyChecking\s+(?:no|off)|chmod\s+(?:-R\s+)?777|curl[^\n]*\|\s*(?:sudo\s+)?(?:ba)?sh|iptables\s+-F|ufw\s+disable|rm\s+-rf\s+\//i', $all)) {
            $issues[] = 'unsafe_configuration';
        }
        $operational = $topic['category'] === 'cybersecurity' ||
            ($topic['category'] === 'devops' && preg_match('/```|sshd_config|PasswordAuthentication|systemctl|firewall/i', $all));
        if ($operational && (! preg_match('/warn|risk|lock.?out/i', $all) || ! preg_match('/validat|sshd -t|test/i', $all) || ! preg_match('/rollback|roll back|recover|restore|existing session/i', $all))) {
            $issues[] = 'safety_recovery_missing';
        }
        if ($topic['category'] === 'film_tv' && preg_match('/```|software architecture|programming analogy|microservices/i', $all)) {
            $issues[] = 'category_style_mismatch';
        }
        if ($review !== null) {
            if (! Schemas::valid($review, Schemas::get('review'))) {
                $issues[] = 'review_invalid';
            } else {
                foreach ($review['checks'] as $name => $passed) {
                    if (! $passed) {
                        $issues[] = 'review_'.$name;
                    }
                }
                $indexes = array_column($review['blocks'], 'index');
                sort($indexes);
                if ($indexes !== array_keys($draft['blocks'])) {
                    $issues[] = 'review_incomplete';
                }
                foreach ($review['blocks'] as $block) {
                    if (! $block['supported'] || ! $block['safe']) {
                        $issues[] = 'review_block_'.$block['index'].'_unsupported_or_unsafe';
                    }
                }
                if ($review['issues']) {
                    $issues[] = 'review_unresolved_issues';
                }
            }
        }

        return ['issues' => array_values(array_unique($issues)), 'requires_human_review' => (bool) $operational,
            'evidence_errors' => $evidenceErrors];
    }

    private function markdownIssues(string $text): array
    {
        $issues = [];
        $inCode = false;
        $prose = [];
        foreach (explode("\n", $text) as $line) {
            $line = trim($line);
            if (str_starts_with($line, '```')) {
                if (! $inCode && ! preg_match('/^```[a-zA-Z0-9_+.-]*$/', $line) ||
                    $inCode && $line !== '```' || preg_match('/Copy$/i', $line)) {
                    $issues[] = 'markdown_invalid';
                }
                $inCode = ! $inCode;
            } elseif (! $inCode) {
                $prose[] = $line;
            }
        }
        if ($inCode || str_contains($text, '~~~')) {
            $issues[] = 'markdown_unclosed_fence';
        }
        $plain = implode("\n", $prose);
        if (preg_match('/^#{1,6}\s/m', $plain) || preg_match('/<\/?[a-z][^>]*>|\[[^\]]*\]\s*\(/i', $plain)) {
            $issues[] = 'markdown_invalid';
        }
        // Validate each table separately, without mistaking shell pipes for tables.
        $table = [];
        foreach (array_merge($prose, ['']) as $line) {
            if (preg_match('/^\|.*\|$/', $line)) {
                $table[] = $line;
            } elseif ($table) {
                $width = substr_count($table[0], '|');
                if (count($table) < 2 || ! preg_match('/^\|(?:\s*:?-{3,}:?\s*\|)+$/', $table[1]) ||
                    count(array_filter($table, fn ($row) => substr_count($row, '|') !== $width)) > 0) {
                    $issues[] = 'markdown_broken_table';
                }
                $table = [];
            }
        }

        return $issues;
    }
}
