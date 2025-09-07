<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'firstname' => ['nullable'],
            'name' => ['required'],
            'email' => ['sometimes', 'email', 'max:254', 'unique:users,email'.$this->user?->id],
            'telephone' => ['nullable'],
            'address' => ['nullable'],
            'role' => ['nullable'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
