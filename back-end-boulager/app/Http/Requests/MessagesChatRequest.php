<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessagesChatRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'expediteur_id' => ['required', 'exists:users'],
            'destinataire_id' => ['required', 'exists:users'],
            'contenu' => ['required'],
            'type_message' => ['required'],
            'lu' => ['boolean'],
            'is_ai_response' => ['boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
