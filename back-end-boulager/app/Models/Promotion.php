<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'type',
        'valeur_remise',
        'date_debut',
        'date_fin',
        'actif',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'produits_promotions')
            ->withTimestamps();
    }
}
