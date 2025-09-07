<?php

namespace App\Http\Resources;

use App\Models\CommandeProduit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CommandeProduit */
class CommandeProduitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantite' => $this->quantite,
            'prix_unitaire' => $this->prix_unitaire,
            'sous_total' => $this->sous_total,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'commande_id' => $this->commande_id,
            'produit_id' => $this->produit_id,

            'commande' => new CommandeResource($this->whenLoaded('commande')),
            'produit' => new produitResource($this->whenLoaded('produit')),
        ];
    }
}
