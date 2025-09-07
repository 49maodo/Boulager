<?php

namespace App\Http\Resources;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin produit */
class produitResource extends JsonResource
{
    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'description' => $this->description,
            'prix' => $this->prix,
            'prix_promotion' => $this->getPrixPromotionAttribute(),
            'quantite_stock' => $this->quantite_stock,
            'image' => $this->image ? Storage::url($this->image) : null,
            'actif' => $this->actif,
            'categorie' => $this->whenLoaded('categorie') ? [
                'id' => $this->Categorie->id,
                'nom' => $this->Categorie->nom,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
