<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commande extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'numero_commande',
        'client_id',
        'statut',
        'montant_total',
        'mode_paiement',
        'adresse_livraison',
        'date_livraison',
    ];

    protected $casts = [
        'date_livraison' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

//    public function produits(): BelongsToMany
//    {
//        return $this->belongsToMany(Produit::class, 'commande_produits', 'commande_id', 'produit_id');
//    }
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'commande_produits')
            ->withPivot(['quantite', 'prix_unitaire', 'sous_total'])
            ->withTimestamps();
    }
    public function commandeProduits()
    {
        return $this->hasMany(CommandeProduit::class, 'commande_id');
    }
    // Relation avec les paiements
    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
    public function estPaye(): bool
    {
        return $this->paiements()->where('statut_paiement', 'reussi')->exists();
    }
    // Méthodes utilitaires pour les statuts
    public function peutEtrePaye()
    {
        return in_array($this->statut, ['en_attente', 'confirmee']);
    }

    public function marquerCommeConfirmee()
    {
        $this->update(['statut' => 'confirmee']);
    }
}
