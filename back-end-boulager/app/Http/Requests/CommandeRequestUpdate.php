<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommandeRequestUpdate extends FormRequest
{
    public function rules(): array
    {
        return [
            'mode_paiement' => 'nullable|in:espece,wave,om',
            'adresse_livraison' => ['sometimes', 'sometimes'],
            'date_livraison' => ['sometimes', 'sometimes', 'date', 'after_or_equal:today'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
