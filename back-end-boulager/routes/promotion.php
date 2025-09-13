<?php

//Route::apiResource('promotions',
//    \App\Http\Controllers\PromotionController::class
//)->middleware('auth');
Route::prefix('promotions')->group(function () {
    Route::get('', [\App\Http\Controllers\PromotionController::class, 'index'])
        ->name('promotions.index');

    Route::get('{promotion}', [\App\Http\Controllers\PromotionController::class, 'show'])
        ->name('promotions.show');

    Route::post('', [\App\Http\Controllers\PromotionController::class, 'store'])
        ->name('promotions.store')
        ->middleware('auth');

    Route::put('{promotion}', [\App\Http\Controllers\PromotionController::class, 'update'])
        ->name('promotions.update')
        ->middleware('auth:api');

    Route::delete('{promotion}', [\App\Http\Controllers\PromotionController::class, 'destroy'])
        ->name('promotions.destroy')
        ->middleware('auth');
});
