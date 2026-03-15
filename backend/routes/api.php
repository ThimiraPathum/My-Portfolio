<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SiteSettingController;

// Public routes
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'Backend is live!']);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::get('/experiences', [ExperienceController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);
Route::get('/settings', [SiteSettingController::class, 'index']);

// Auth routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('admin/projects', ProjectController::class)->except(['index', 'show']);
    Route::apiResource('admin/skills', SkillController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('admin/blogs', BlogController::class)->except(['index', 'show']);
    Route::apiResource('admin/experiences', ExperienceController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('admin/messages', MessageController::class)->only(['index', 'destroy']);
    Route::post('/admin/settings', [SiteSettingController::class, 'update']);
});
