<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
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

    public function Categorie(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(categorie::class);
    }

    public function commandes(): BelongsToMany
    {
        return $this->belongsToMany(Commande::class, 'commande_produit', 'produit_id', 'commande_id');
    }
    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'produits_promotions')
            ->withTimestamps();
    }
    // prixe_promotion attribute calculation promotion_produit
    public function getPrixPromotionAttribute()
    {
        $now = now();
        $activePromotion = $this->promotions()
            ->where('date_debut', '<=', $now)
            ->where('date_fin', '>=', $now)
            ->orderByDesc('valeur_remise')
            ->first();

        if ($activePromotion) {
            if (strtoupper($activePromotion->type) === 'POURCENTAGE') {
                return round($this->prix * (1 - $activePromotion->valeur_remise / 100), 2);
            } elseif (strtoupper($activePromotion->type) === 'MONTANT_FIXE') {
                return max(0, round($this->prix - $activePromotion->valeur_remise, 2));
            }
        }

        return $this->prix;
    }
}
