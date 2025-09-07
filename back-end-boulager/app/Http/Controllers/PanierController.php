<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Services\PanierService;
use Illuminate\Http\Request;

class PanierController extends Controller
{
    protected $panierService;

    public function __construct(PanierService $panierService)
    {
        $this->panierService = $panierService;
    }
    public function ajouter(Request $request){
        $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1|max:10'
        ]);
        return $this->panierService->Ajouter($request);
    }
    public function afficher(){
        return $this->panierService->Afficher();
    }

    public function supprimer(Request $request, $produitId){
        return $this->panierService->Supprimer($request,$produitId);
    }

    public function vider()
    {
        return $this->panierService->Vider();
    }

}
