<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function ($any) {
    if (in_array(explode('/', $any)[0], ['settings', 'projects', 'blogs', 'auth', 'skills', 'experiences', 'messages', 'upload'])) {
        return redirect('/api/' . $any);
    }
    return 'Hello World';
})->where('any', '.*');

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
