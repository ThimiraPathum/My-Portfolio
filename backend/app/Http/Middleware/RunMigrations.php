<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class RunMigrations
{
    public function handle(Request $request, Closure $next)
    {
        if (app()->environment('production')) {
            try {
                Artisan::call('migrate', ['--force' => true]);
                Artisan::call('db:seed', ['--force' => true]);
            } catch (\Exception $e) {
                // Silent fail
            }
        }

        return $next($request);
    }
}
