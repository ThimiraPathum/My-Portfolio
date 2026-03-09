<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResetPasswordController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\FileUploadController;

// ─── Public Routes ───────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login',    [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [ResetPasswordController::class, 'sendResetLinkEmail']);
    Route::post('reset-password', [ResetPasswordController::class, 'reset']);
});

Route::get('projects',          [ProjectController::class, 'index']);
Route::get('projects/{id}',     [ProjectController::class, 'show']);
Route::get('skills',            [SkillController::class, 'index']);
Route::get('experiences',       [ExperienceController::class, 'index']);
Route::post('messages',         [MessageController::class, 'store']);

// Site settings (public read)
Route::get('settings',          [SiteSettingController::class, 'index']);

// Blog (public)
Route::get('blogs',             [BlogController::class, 'index']);
Route::get('blogs/{slug}',      [BlogController::class, 'show']);
Route::post('blogs/{id}/comments', [CommentController::class, 'store']);

// ─── Protected Routes (JWT) ──────────────────────────────────
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me',       [AuthController::class, 'me']);
    });

    // Site settings update
    Route::post('settings', [SiteSettingController::class, 'update']);

    // File upload
    Route::post('upload',   [FileUploadController::class, 'upload']);
    Route::post('upload/delete', [FileUploadController::class, 'delete']);

    // Projects
    Route::post('projects',         [ProjectController::class, 'store']);
    Route::put('projects/{id}',     [ProjectController::class, 'update']);
    Route::delete('projects/{id}',  [ProjectController::class, 'destroy']);

    // Skills
    Route::post('skills',           [SkillController::class, 'store']);
    Route::put('skills/{id}',       [SkillController::class, 'update']);
    Route::delete('skills/{id}',    [SkillController::class, 'destroy']);

    // Experiences
    Route::post('experiences',          [ExperienceController::class, 'store']);
    Route::put('experiences/{id}',      [ExperienceController::class, 'update']);
    Route::delete('experiences/{id}',   [ExperienceController::class, 'destroy']);

    // Messages (admin)
    Route::get('messages',              [MessageController::class, 'index']);
    Route::put('messages/{id}/read',    [MessageController::class, 'markRead']);
    Route::delete('messages/{id}',      [MessageController::class, 'destroy']);

    // Blog (admin)
    Route::get('admin/blogs',           [BlogController::class, 'adminIndex']);
    Route::post('blogs',                [BlogController::class, 'store']);
    Route::put('blogs/{id}',            [BlogController::class, 'update']);
    Route::delete('blogs/{id}',         [BlogController::class, 'destroy']);

    // Comments (admin)
    Route::get('admin/comments',            [CommentController::class, 'all']);
    Route::get('blogs/{id}/comments',       [CommentController::class, 'index']);
    Route::put('comments/{id}/approve',     [CommentController::class, 'approve']);
    Route::delete('comments/{id}',          [CommentController::class, 'destroy']);
});
