<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;

// Try to login via API
$credentials = [
    'email' => 'pathumt675@gmail.com',
    'password' => 'thimirAP12335.'
];

echo "Testing login...\n";
$request = Request::create('/api/auth/login', 'POST', $credentials);
$request->headers->set('Accept', 'application/json');
$response = $app->handle($request);

if ($response->getStatusCode() === 200) {
    $data = json_decode($response->getContent(), true);
    $token = $data['access_token'];
    echo "Login SUCCESS. Token: " . substr($token, 0, 20) . "...\n";
    
    echo "Fetching messages...\n";
    $msgRequest = Request::create('/api/messages', 'GET');
    $msgRequest->headers->set('Accept', 'application/json');
    $msgRequest->headers->set('Authorization', 'Bearer ' . $token);
    
    // We need to re-handle correctly or use Auth::guard('api')->setToken($token)
    // Actually, handling a new request should work.
    $msgResponse = $app->handle($msgRequest);
    
    if ($msgResponse->getStatusCode() === 200) {
        $msgs = json_decode($msgResponse->getContent(), true);
        echo "Fetch SUCCESS. Count: " . count($msgs) . "\n";
    } else {
        echo "Fetch FAILED. Status: " . $msgResponse->getStatusCode() . "\n";
        echo "Body: " . $msgResponse->getContent() . "\n";
    }
} else {
    echo "Login FAILED. Status: " . $response->getStatusCode() . "\n";
    echo "Body: " . $response->getContent() . "\n";
}
