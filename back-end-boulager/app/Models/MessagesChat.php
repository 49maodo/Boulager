<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessagesChat extends Model
{
    protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'contenu',
        'type_message',
        'lu',
        'is_ai_response',
    ];

    protected $casts = [
        'lu' => 'boolean',
        'is_ai_response' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    /**
     * Scope pour récupérer les messages d'une conversation
     */
    public function scopeConversation($query, $userId1, $userId2)
    {
        return $query->where(function ($q) use ($userId1, $userId2) {
            $q->where('expediteur_id', $userId1)->where('destinataire_id', $userId2);
        })->orWhere(function ($q) use ($userId1, $userId2) {
            $q->where('expediteur_id', $userId2)->where('destinataire_id', $userId1);
        })->orderBy('created_at', 'asc');
    }

    /**
     * Scope pour les messages non lus
     */
    public function scopeNonLus($query, $userId)
    {
        return $query->where('destinataire_id', $userId)
            ->where('lu', false);
    }

    /**
     * Marquer comme lu
     */
    public function marquerCommeLu(): bool
    {
        return $this->update(['lu' => true]);
    }
}
