<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return 'Hello the World';
});

// Keep root live
Route::get('/', function () {
    return 'Hello my World';
});

Route::any('/{any}', function () {
    return 'Hello World';
})->where('any', '.*');
