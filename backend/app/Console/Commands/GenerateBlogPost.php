<?php

namespace App\Console\Commands;

use App\Services\BlogAgent\AgentException;
use App\Services\BlogAgent\BlogAgent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GenerateBlogPost extends Command
{
    protected $signature = 'blog:generate
        {--topic= : Specific article topic}
        {--source=* : Approved HTTPS source URL; repeat for additional sources}
        {--dry-run : Research and preview without saving posts, reports or locks}
        {--draft : Always save an eligible article as a draft}';

    protected $description = 'Research, draft and validate an evidence-led article (draft-only by default)';

    public function handle(BlogAgent $agent): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $lock = null;
        try {
            if (! $dryRun) {
                $lock = Cache::store(config('blog_agent.lock_store'))->lock('blog-agent:generate', 1800);
                if (! $lock->get()) {
                    $this->warn('Another blog generation is in progress.');

                    return self::SUCCESS;
                }
            }
            $this->info('AI Blog Agent V2: research -> plan -> draft -> validate -> save');
            $result = $agent->run($this->option('topic'), $this->option('source'), $dryRun, (bool) $this->option('draft'));
            if ($dryRun) {
                $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            } else {
                $this->info("Saved blog #{$result['id']} as {$result['status']}.");
                $this->line('Private evidence report: '.$result['report']);
                if ($result['requires_human_review']) {
                    $this->warn('Operational safety requires human review before publication.');
                }
                Log::info('blog_agent.saved', $result);
            }

            return self::SUCCESS;
        } catch (AgentException $e) {
            $this->error('Blog generation stopped: '.$e->reason);
            if (! $dryRun) {
                Log::warning('blog_agent.rejected', ['reason' => $e->reason]);
            }

            return self::FAILURE;
        } catch (\Throwable $e) {
            // Exception messages can contain request headers, URLs or credentials.
            $this->error('Blog generation stopped: internal_error (check server configuration).');
            if (! $dryRun) {
                Log::error('blog_agent.internal_error', ['type' => get_class($e)]);
            }

            return self::FAILURE;
        } finally {
            $lock?->release();
        }
    }
}
