<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
$migrations = DB::table('migrations')->get();
foreach ($migrations as $m) {
    echo $m->migration . " (Batch: " . $m->batch . ")\n";
}
