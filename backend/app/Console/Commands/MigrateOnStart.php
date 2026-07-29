<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MigrateOnStart extends Command
{
    protected $signature = 'migrate:auto';
    protected $description = 'Auto migrate on startup';

    public function handle()
    {
        Artisan::call('migrate', ['--force' => true]);
        $this->info('Migrations completed!');
    }
}
