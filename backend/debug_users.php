<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$users = User::all();
foreach ($users as $user) {
    echo "ID: " . $user->id . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Hash: " . $user->password . "\n";
    $check1 = Hash::check('thimirAP12335.', $user->password);
    $check2 = Hash::check('Admin@123', $user->password);
    echo "Check 'thimirAP12335.': " . ($check1 ? "SUCCESS" : "FAIL") . "\n";
    echo "Check 'Admin@123': " . ($check2 ? "SUCCESS" : "FAIL") . "\n";
    echo "-------------------\n";
}
