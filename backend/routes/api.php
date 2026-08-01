<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\FileUploadController;

// Public routes
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'Backend is live!']);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/derived', [SkillController::class, 'derivedFromProjects']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);
Route::get('/experiences', [ExperienceController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);
Route::get('/settings', [SiteSettingController::class, 'index']);

// Comments (Public)
Route::post('/blogs/{blogId}/comments', [CommentController::class, 'store']);
Route::get('/blogs/{blogId}/comments', [CommentController::class, 'index']);

// Auth routes
Route::middleware('throttle:5,15')->post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [App\Http\Controllers\Api\ResetPasswordController::class, 'sendResetLinkEmail']);
Route::post('/auth/reset-password', [App\Http\Controllers\Api\ResetPasswordController::class, 'reset']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin Resources (Matching frontend paths)
    Route::get('/messages', [MessageController::class, 'index']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markRead']);

    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{id}', [SkillController::class, 'update']);
    Route::delete('/skills/{id}', [SkillController::class, 'destroy']);

    Route::post('/experiences', [ExperienceController::class, 'store']);
    Route::put('/experiences/{id}', [ExperienceController::class, 'update']);
    Route::delete('/experiences/{id}', [ExperienceController::class, 'destroy']);

    Route::get('/admin/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

    Route::get('/admin/comments', [CommentController::class, 'all']);
    Route::put('/comments/{id}/approve', [CommentController::class, 'approve']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    Route::post('/settings', [SiteSettingController::class, 'update']);
    Route::put('/settings/{key}', [SiteSettingController::class, 'updateSingle']);

    // File Upload
    Route::post('/upload', [FileUploadController::class, 'upload']);
    Route::delete('/upload', [FileUploadController::class, 'delete']);
});
