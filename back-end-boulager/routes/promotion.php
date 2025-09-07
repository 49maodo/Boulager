<?php

Route::apiResource('promotions',
    \App\Http\Controllers\PromotionController::class
)->middleware('auth');
