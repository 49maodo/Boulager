<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class produit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nom',
        'description',
        'prix',
        'quantite_stock',
        'image',
        'actif',
        'categorie_id',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];
    public function categorie()
    {
        return $this->belongsTo(categorie::class);
    }
}
