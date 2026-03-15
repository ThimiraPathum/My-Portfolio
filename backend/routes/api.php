<?php

use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Projects endpoint
Route::get('/projects', function () {
    return response()->json([
        [
            'id' => 1,
            'title' => 'Portfolio Website',
            'description' => 'Full-stack portfolio built with Laravel & React',
            'technologies' => 'Laravel, React, MySQL, Tailwind CSS',
            'link' => 'https://thimiradev.me',
        ],
        [
            'id' => 2,
            'title' => 'Chat Application',
            'description' => 'Real-time chat app with WebSockets',
            'technologies' => 'Laravel, Vue.js, Redis',
            'link' => 'https://example.com',
        ],
    ]);
});

// Skills endpoint
Route::get('/skills', function () {
    return response()->json([
        ['id' => 1, 'name' => 'PHP', 'proficiency' => 90, 'category' => 'Backend'],
        ['id' => 2, 'name' => 'Laravel', 'proficiency' => 85, 'category' => 'Backend'],
        ['id' => 3, 'name' => 'React', 'proficiency' => 80, 'category' => 'Frontend'],
        ['id' => 4, 'name' => 'MySQL', 'proficiency' => 85, 'category' => 'Database'],
    ]);
});
