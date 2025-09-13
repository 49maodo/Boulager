<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePromotionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nom' => ['required'],
            'description' => ['required'],
            'type' => 'required|in:POURCENTAGE,MONTANT_FIXE,ACHETEZ_X_OBTENEZ_Y',
            'valeur_remise' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->type === 'POURCENTAGE' && $value > 100) {
                        $fail('Le pourcentage ne peut pas dépasser 100%.');
                    }
                }
            ],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
            'produits_ids' => 'array',
            'produits_ids.*' => 'exists:produits,id'
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
