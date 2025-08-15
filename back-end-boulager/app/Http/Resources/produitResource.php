<?php

namespace App\Http\Resources;

use App\Models\produit;
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
            'quantite_stock' => $this->quantite_stock,
            'image' => $this->image ? Storage::url($this->image) : null,
            'actif' => $this->actif,
//            'categorie_id' => $this->categorie_id,
            'categorie' => $this->categorie(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
