<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaiementRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'commande_id' => ['required', 'exists:commandes'],
            'montant' => ['required', 'numeric'],
            'mode_paiement' => ['required'],
            'statut_paiement' => ['required'],
            'reference_transaction' => ['required'],
            'details_reponse' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
