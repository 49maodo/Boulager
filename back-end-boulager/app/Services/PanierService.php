<?php

namespace App\Services;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PanierService
{
    private function getPanierKey()
    {
        $user = auth()->user();
        if (!$user) {
            throw new \Exception('Utilisateur non authentifié');
        }
        return "panier_user_{$user->id}";
    }

    public function Ajouter(Request $request)
    {
        try {
            $produit = Produit::findOrFail($request->produit_id);

            // Vérifier la disponibilité
            if (!$produit->actif || $produit->quantite_stock < $request->quantite) {
                return response()->json([
                    'success' => false,
                    'error' => 'Produit indisponible ou stock insuffisant'
                ], 400);
            }

            $panierKey = $this->getPanierKey();
            $panier = Cache::get($panierKey, []);
            $key = $request->produit_id;

            if (isset($panier[$key])) {
                // Produit déjà dans le panier, met à jour la quantité
                $nouvelleQuantite = $request->quantite;

                if ($nouvelleQuantite > $produit->quantite_stock) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Quantité totale dépasse le stock disponible'
                    ], 400);
                }

                $panier[$key]['quantite'] = $nouvelleQuantite;
            } else {
                // Nouveau produit dans le panier
                $panier[$key] = [
                    'produit_id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_unitaire' => $produit->getPrixPromotionAttribute(),
                    'quantite' => $request->quantite,
                    'image' => $produit->url_image,
                    'ajoute_le' => now()
                ];
            }

            // Sauvegarder le panier en cache (expire après 24h)
            Cache::put($panierKey, $panier, 60 * 24);


            return response()->json([
                'success' => true,
                'message' => 'Produit ajouté au panier avec succès',
                'data' => [
                    'panier_count' => count($panier)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur ajout panier:', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'ajout au panier'
            ], 500);
        }
    }

    public function Afficher()
    {
        try {
            $panierKey = $this->getPanierKey();
            $panier = Cache::get($panierKey, []);


            if (empty($panier)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'meta' => [
                        'total' => 0,
                        'nombre_articles' => 0
                    ]
                ]);
            }

            $panierDetails = [];
            $total = 0;
            $nombreArticles = 0;

            foreach ($panier as $item) {
                $produit = Produit::find($item['produit_id']);

                if (!$produit) {
                    continue; // Produit supprimé, on l'ignore
                }

                $sousTotal = $item['prix_unitaire'] * $item['quantite'];
                $nombreArticles += $item['quantite'];

                $panierDetails[] = [
                    'produit_id' => $item['produit_id'],
                    'quantite' => $item['quantite'],
                    'produit' => [
                        'id' => $produit->id,
                        'nom' => $produit->nom,
                        'prix' => number_format($produit->getPrixPromotionAttribute(), 2, '.', ''),
                        'image' => $produit->url_image,
                        'description' => $produit->description ?? '',
                        'quantite_stock' => $produit->quantite_stock,
                        'actif' => $produit->actif
                    ]
                ];

                $total += $sousTotal;
            }

            return response()->json([
                'success' => true,
                'data' => $panierDetails,
                'meta' => [
                    'total' => $total,
                    'nombre_articles' => $nombreArticles
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur affichage panier:', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'affichage du panier'
            ], 500);
        }
    }

    public function Supprimer(Request $request, $produitId)
    {
        try {
            $panierKey = $this->getPanierKey();
            $panier = Cache::get($panierKey, []);

            if (isset($panier[$produitId])) {
                unset($panier[$produitId]);
                Cache::put($panierKey, $panier, 60 * 24);

                return response()->json([
                    'success' => true,
                    'message' => 'Produit retiré du panier'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Produit non trouvé dans le panier'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    public function Vider()
    {
        try {
            $panierKey = $this->getPanierKey();
            Cache::forget($panierKey);

            return response()->json([
                'success' => true,
                'message' => 'Panier vidé',
                'data' => []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du vidage du panier'
            ], 500);
        }
    }

    // Méthode pour récupérer le panier brut (pour les commandes)
    public function getPanierRaw()
    {
        try {
            $panierKey = $this->getPanierKey();
            return Cache::get($panierKey, []);
        } catch (\Exception $e) {
            return [];
        }
    }
}
