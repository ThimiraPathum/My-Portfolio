<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Hello World';
});

Route::get('/settings', function () {
    return redirect('/api/settings');
});

Route::get('/projects', function () {
    return redirect('/api/projects');
});

Route::get('/blogs', function () {
    return redirect('/api/blogs');
});

Route::get('/api/health', function () {
    return json_encode(['status' => 'ok']);
});

Route::get('/debug', function () {
    return response()->json([
        'php_version' => PHP_VERSION,
        'extensions' => get_loaded_extensions(),
        'env' => app()->environment(),
        'debug' => config('app.debug'),
    ]);
});
