<?php

namespace App\Http\Resources;

use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Promotion */
class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'description' => $this->description,
            'type' => $this->type,
            'valeur_remise' => $this->valeur_remise,
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'NbProduits' => $this->produits()->count(),
            'produits_ids' => $this->produits()->pluck('produit_id'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
