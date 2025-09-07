<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommandeRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'mode_paiement' => 'nullable|in:espece,wave,om',
            'adresse_livraison' => ['required', 'sometimes'],
            'date_livraison' => ['required', 'sometimes', 'date', 'after_or_equal:today'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
