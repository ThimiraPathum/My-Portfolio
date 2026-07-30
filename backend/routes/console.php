<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Console\Scheduling\Event;

// Macro for everyTwoDays
if (!Event::hasMacro('everyTwoDays')) {
    Event::macro('everyTwoDays', function () {
        return $this->cron('0 0 */2 * *');
    });
}

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule AI Blog Agent to run every 2 days
Schedule::command('blog:generate')->everyTwoDays();
