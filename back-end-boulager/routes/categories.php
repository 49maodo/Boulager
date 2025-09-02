<?php

use App\Http\Controllers\categorieController;

Route::prefix('categories')->group(function () {
    Route::get('', [categorieController::class, 'index'])
        ->name('categories.index');

    Route::get('{categorie}', [categorieController::class, 'show'])
        ->name('categories.show');

    Route::post('', [categorieController::class, 'store'])
        ->name('categories.store')
        ->middleware('auth:sanctum');

    Route::put('{categorie}', [categorieController::class, 'update'])
        ->name('categories.update')
        ->middleware('auth');

    Route::delete('{categorie}', [categorieController::class, 'destroy'])
        ->name('categories.destroy')
        ->middleware('auth');
});
