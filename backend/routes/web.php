<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Laravel is working!']);
});

Route::get('/api/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/api/projects', function () {
    return response()->json([
        ['id' => 1, 'title' => 'Portfolio Website', 'description' => 'Full-stack portfolio'],
        ['id' => 2, 'title' => 'Chat App', 'description' => 'Real-time messaging'],
    ]);
});

Route::get('/api/skills', function () {
    return response()->json([
        ['id' => 1, 'name' => 'PHP', 'proficiency' => 90],
        ['id' => 2, 'name' => 'Laravel', 'proficiency' => 85],
    ]);
});
