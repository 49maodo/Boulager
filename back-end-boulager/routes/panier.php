<?php

Route::prefix('panier')->group(function () {
    Route::post('/ajouter', [\App\Http\Controllers\PanierController::class, 'ajouter']);
    Route::get('/', [\App\Http\Controllers\PanierController::class, 'afficher']);
    Route::delete('/{produitId}', [\App\Http\Controllers\PanierController::class, 'supprimer']);
    Route::delete('/', [\App\Http\Controllers\PanierController::class, 'vider']);
})->middleware("auth");
