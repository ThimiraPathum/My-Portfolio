<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return 'Hello World';
});

// Auth routes (Root level for debugging/session support, updated for JWT compatibility)
Route::post('/auth/login', function () {
    $credentials = request(['email', 'password']);
    \Log::info('Web/JWT Login attempt', ['email' => $credentials['email']]);
    
    if (!$token = Auth::guard('api')->attempt($credentials)) {
        \Log::error('Web/JWT Login failed: Invalid credentials', ['email' => $credentials['email']]);
        return response()->json(['error' => 'Invalid credentials'], 401);
    }
    
    \Log::info('Web/JWT Login successful', ['email' => $credentials['email']]);
    return response()->json([
        'access_token' => $token,
        'token_type'   => 'bearer',
        'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
        'user'         => Auth::guard('api')->user(),
    ]);
});

Route::post('/auth/logout', function () {
    Auth::guard('api')->logout();
    return response()->json(['message' => 'Successfully logged out']);
});

Route::get('/auth/user', function () {
    return response()->json(Auth::guard('api')->user());
})->middleware('auth:api');

// Preservation of API health and redirects
Route::get('/api/health', function () {
    return json_encode(['status' => 'ok']);
});

Route::any('/{any}', function () {
    return 'Hello World';
})->where('any', '.*');
