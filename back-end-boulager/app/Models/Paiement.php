<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    protected $fillable = [
        'commande_id',
        'montant',
        'mode_paiement',
        'statut_paiement',
        'reference_transaction',
        'details_reponse',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'details_reponse' => 'array'
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }
}
