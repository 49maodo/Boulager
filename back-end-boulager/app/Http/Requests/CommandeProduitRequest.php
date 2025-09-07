<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommandeProduitRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'commande_id' => ['required', 'exists:commandes'],
            'produit_id' => ['required', 'exists:produits'],
            'quantite' => ['required', 'integer'],
            'prix_unitaire' => ['required', 'numeric'],
            'sous_total' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
