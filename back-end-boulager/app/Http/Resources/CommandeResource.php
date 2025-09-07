<?php

namespace App\Http\Resources;

use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Commande */
class CommandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero_commande' => $this->numero_commande,
            'statut' => $this->statut,
            'montant_total' => $this->montant_total,
            'mode_paiement' => $this->mode_paiement,
            'adresse_livraison' => $this->adresse_livraison,
            'date_livraison' => $this->date_livraison,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'est_paye' => $this->estPaye(),
            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client->id,
                    'name' => $this->client->name,
                    'firstname' => $this->client->firstname,
                    'email' => $this->client->email,
                    'telephone' => $this->client->telephone,
                ];
            }),
            'articles' => $this->whenLoaded('commandeProduits', function () {
                return $this->produits->map(function ($produit) {
                    return [
                        'id' => $produit->id,
                        'nom' => $produit->nom,
                        'description' => $produit->description,
                        'prix_unitaire' => $produit->pivot->prix_unitaire,
                        'quantite' => $produit->pivot->quantite,
                        'sous_total' => $produit->pivot->sous_total,
                    ];
                });
            }),
        ];
    }
}
