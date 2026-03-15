<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Hello World';
});

Route::get('/api/health', function () {
    return json_encode(['status' => 'ok']);
});
