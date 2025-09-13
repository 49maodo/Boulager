<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommandeProduit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'commande_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'sous_total',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}
