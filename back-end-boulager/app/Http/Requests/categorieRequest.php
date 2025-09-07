<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class categorieRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nom' => ['required','max:255' , 'unique:categories,nom,'.$this->categorie?->id],
            'description' => ['required'],
            'actif' => ['nullable', 'boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
