<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class produitRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nom' => ['required'],
            'description' => ['required'],
            'prix' => ['required', 'numeric', 'min:0'],
            'quantite_stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'], // max size 2MB
            'actif' => ['boolean'],
            'categorie_id' => ['required', 'integer', 'exists:categories,id'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
