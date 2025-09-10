<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
require __DIR__.'/auth.php';
require __DIR__.'/categories.php';
require __DIR__.'/produit.php';
require __DIR__.'/panier.php';
require __DIR__.'/commande.php';
require __DIR__.'/promotion.php';
require __DIR__.'/paiement.php';
require __DIR__.'/user.php';
