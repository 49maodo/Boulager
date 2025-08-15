<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class categorieRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nom' => ['required', 'unique:categories,nom','max:255'],
            'description' => ['required'],
            'actif' => ['nullable', 'boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
