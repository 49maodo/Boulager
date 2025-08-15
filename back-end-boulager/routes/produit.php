<?php


use App\Http\Controllers\produitController;

Route::prefix('produits')->group(function () {
    Route::get('', [produitController::class, 'index'])
        ->name('produits.index');

    Route::get('{produit}', [produitController::class, 'show'])
        ->name('produits.show');

    Route::post('', [produitController::class, 'store'])
        ->name('produits.store')
        ->middleware('auth');

    Route::post('{produit}', [produitController::class, 'update'])
        ->name('produits.update')
        ->middleware('auth:api');

    Route::delete('{produit}', [produitController::class, 'destroy'])
        ->name('produits.destroy')
        ->middleware('auth');
});
