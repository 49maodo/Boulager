<?php

Route::apiResource('commandes',
    \App\Http\Controllers\CommandeController::class)->middleware('auth');

Route::patch('commandes/{id}/cancel',
    [\App\Http\Controllers\CommandeController::class, 'cancel'])->middleware('auth');
