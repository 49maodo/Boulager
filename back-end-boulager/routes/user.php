<?php

Route::apiResource('users',
    \App\Http\Controllers\UserController::class
)->middleware('auth');
