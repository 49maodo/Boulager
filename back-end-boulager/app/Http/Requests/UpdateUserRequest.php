<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
//            $this->categorie?->id
            'firstname' => 'nullable|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'email', 'max:254', 'unique:users,email'.$this->user?->id],
            'telephone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'role' => ['nullable', 'in:client,admin,employe'],
            'is_active' => 'nullable|boolean',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
