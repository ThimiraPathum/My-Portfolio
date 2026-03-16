<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return 'Hello World';
});

// Keep root live
Route::get('/', function () {
    return 'Hello World';
});

Route::any('/{any}', function () {
    return 'Hello World';
})->where('any', '.*');
