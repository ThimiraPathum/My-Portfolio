<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return 'Hello World';
});

// Auth routes (Root level for debugging/session support)
Route::post('/auth/login', function () {
    $credentials = request(['email', 'password']);
    \Log::info('Web Login attempt', ['email' => $credentials['email']]);
    
    if (Auth::attempt($credentials)) {
        \Log::info('Web Login successful', ['email' => $credentials['email']]);
        return response()->json([
            'message' => 'Login successful',
            'user' => auth()->user()
        ]);
    }
    
    \Log::error('Web Login failed: Invalid credentials', ['email' => $credentials['email']]);
    return response()->json(['message' => 'Invalid credentials'], 401);
});

Route::post('/auth/logout', function () {
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
});

Route::get('/auth/user', function () {
    return response()->json(auth()->user());
})->middleware('auth');

// Preservation of API health and redirects
Route::get('/api/health', function () {
    return json_encode(['status' => 'ok']);
});

Route::any('/{any}', function ($any) {
    if (in_array(explode('/', $any)[0], ['settings', 'projects', 'blogs', 'skills', 'experiences', 'messages', 'upload'])) {
        return redirect('/api/' . $any);
    }
    // Also redirect auth if prefix is used in frontend but routes are here
    if (explode('/', $any)[0] === 'auth') {
         // Keep the logic here for root but allow api prefix redirect if needed
         // However, api.php already has auth routes.
    }
    return 'Hello World';
})->where('any', '.*');
