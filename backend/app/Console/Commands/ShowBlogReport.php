<?php

namespace App\Console\Commands;

use App\Services\BlogAgent\QualityGate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Output\OutputInterface;

class ShowBlogReport extends Command
{
    protected $signature = 'blog:report {report? : Private rejection report path; defaults to the latest rejection}';

    protected $description = 'Inspect a rejected draft and editorial feedback without generating or publishing a post';

    public function handle(): int
    {
        $disk = Storage::disk('blog_research');
        $pattern = '~^reports/rejected-agent-[a-f0-9]{32}-[0-9]{14}-[a-f0-9]{12}\.json$~';
        try {
            $path = $this->argument('report');
            if ($path === null) {
                $path = collect($disk->files('reports'))->filter(fn ($file) => preg_match($pattern, $file))
                    ->sortByDesc(fn ($file) => $disk->lastModified($file))->first();
            }
            if (! is_string($path) || ! preg_match($pattern, $path) || ! $disk->exists($path)) {
                $this->error('No matching rejection report. Run blog:generate once with this version to capture a failure.');

                return self::FAILURE;
            }
            if ($disk->size($path) > 524288) {
                $this->error('Rejection report exceeds the inspection size limit.');

                return self::FAILURE;
            }
            $report = json_decode($disk->get($path), true, 64, JSON_THROW_ON_ERROR);
            // Recompute for older reports too, using the saved evidence snapshot;
            // never fetch today's page as a substitute for that run's sources.
            $evidenceErrors = app(QualityGate::class)->validate($report['draft'], $report['sources'], $report['topic'])['evidence_errors'] ?? [];
            $failed = collect($report['review']['blocks'] ?? [])->filter(fn ($b) => ! ($b['supported'] ?? false) || ! ($b['safe'] ?? false))->pluck('index')->all();
            foreach ($report['gate']['issues'] ?? [] as $issue) {
                if (preg_match('/^block_(\d+)_/', $issue, $match)) {
                    $failed[] = (int) $match[1];
                }
            }
            $blocks = [];
            foreach ($report['draft']['blocks'] ?? [] as $i => $block) {
                if ($failed && ! in_array($i, $failed, true)) {
                    continue;
                }
                $blocks[] = ['number' => $i + 1, 'heading' => $block['heading'], 'text' => $block['text'], 'evidence' => $block['evidence']];
            }
            $summary = ['report' => $path, 'title' => $report['draft']['title'] ?? '',
                'revisions' => $report['revisions'] ?? null, 'content_revisions' => $report['content_revisions'] ?? null,
                'evidence_repairs' => $report['evidence_repairs'] ?? null,
                'issues' => $report['gate']['issues'] ?? [], 'reviewer_feedback' => $report['review']['issues'] ?? [], 'blocks' => $blocks,
                'evidence_errors' => $evidenceErrors,
                'evidence_sources' => array_values(array_map(fn ($source) => [
                    'id' => $source['id'], 'url' => $source['url'], 'text' => $source['text'],
                ], array_filter($report['sources'], fn ($source) => in_array($source['id'], array_merge(
                    array_column($evidenceErrors, 'source_id'),
                    array_column(array_merge(...array_column($blocks, 'evidence')), 'source_id')
                ), true))))];
            // Treat model prose as data: no terminal controls/markup, no configured
            // key if a provider ever echoes it into an unusual response.
            $redact = function ($value) use (&$redact) {
                if (is_array($value)) {
                    return array_map($redact, $value);
                }
                if (! is_string($value)) {
                    return $value;
                }
                $key = (string) config('blog_agent.api_key');

                return $key === '' ? $value : str_replace($key, '[REDACTED]', $value);
            };
            $this->output->writeln(json_encode($redact($summary), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), OutputInterface::OUTPUT_RAW);

            return self::SUCCESS;
        } catch (\Throwable) {
            $this->error('Unable to read rejection report. Check the private storage permissions and report format.');

            return self::FAILURE;
        }
    }
}
