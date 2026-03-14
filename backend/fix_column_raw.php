<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
try {
    DB::statement("ALTER TABLE experiences ADD COLUMN certificate_url VARCHAR(255) NULL AFTER tech_stack");
    echo "Success: Column added.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
