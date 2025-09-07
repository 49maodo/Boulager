<?php

use App\Http\Controllers\PaiementController;

Route::prefix('commandes')->group(function () {
    // Route pour simuler un paiement
    Route::post('{commande}/payer', [PaiementController::class, 'simulerPaiement']);

    // Route pour obtenir l'historique des paiements
    Route::get('{commande}/paiements', [PaiementController::class, 'historiquePaiements']);
})->middleware('auth');
