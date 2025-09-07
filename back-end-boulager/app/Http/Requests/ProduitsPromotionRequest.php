<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProduitsPromotionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'produit_id' => ['required', 'exists:produits'],
            'promotion_id' => ['required', 'exists:promotions'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
