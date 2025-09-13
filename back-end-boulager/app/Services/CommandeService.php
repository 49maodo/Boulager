<?php

namespace App\Services;
use App\Http\Requests\CommandeRequest;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Models\CommandeProduit;
use App\Models\Produit;
use App\Notifications\CreateCommandeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CommandeService
{
    protected PanierService $panierService;

    public function __construct()
    {
        $this->panierService = new PanierService();
    }

    /**
     * Créer une nouvelle commande à partir du panier
     */
    public function creerCommande(Request $request)
    {
        $this->validerDonneesCommande($request);

        DB::beginTransaction();

        try {
            $user = Auth::user();

            // 1. Vérifier le panier
//            $panier = $this->obtenirPanier();
            $panier = $this->panierService->getPanierRaw();
            $this->verifierPanierNonVide($panier);

            // 2. Générer le numéro de commande
            $numeroCommande = $this->genererNumeroCommande();

            // 3. Créer la commande
            $commande = $this->creerNouvelleCommande($numeroCommande, $user, $request);

            // 4. Traiter les articles du panier
//            $resultatsArticles = $this->traiterArticlesPanier($panier, $commande);
            $resultatsArticles = $this->traiterArticlesPanier($panier, $commande);

            // 5. Mettre à jour le montant total
            $commande->update(['montant_total' => $resultatsArticles['total']]);

            // 6. Créer la facture brouillon
//            $facture = $this->creerFactureBrouillon($commande, $resultatsArticles['total']);

            // 7. Vider le panier
//            $this->viderPanier();
            $this->panierService->Vider();

            DB::commit();

            // 8. Retourner la commande avec ses relations
            $commande->load(['client', 'commandeProduits']);

            $commande->client->notify(new CreateCommandeNotification($commande));

            return [
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => new CommandeResource($commande)
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Créer une commande via Form Request
     */
    public function creerCommandeAvecValidation(CommandeRequest $request)
    {
        DB::beginTransaction();

        try {
            $commande = Commande::create($request->validated());

            DB::commit();

            return [
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => new CommandeResource($commande->load('client', 'commandeProduits.produit'))
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Récupérer les commandes d'un utilisateur avec Resource
     */
    public function obtenirCommandesUtilisateur($perPage = 10)
    {
        $user = Auth::user();

        $commandes = Commande::with(['client', 'commandeProduits.produit'])
            ->where('client_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return CommandeResource::collection($commandes);
    }

    /**
     * Récupérer toutes les commandes (Admin)
     */
    public function obtenirToutesCommandes($perPage = 10)
    {
        $commandes = Commande::with(['client', 'commandeProduits.produit'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return CommandeResource::collection($commandes);
    }

    /**
     * Afficher une commande spécifique
     */
    public function afficherCommande($id)
    {
        $commande = Commande::with(['client', 'commandeProduits.produit'])
            ->where('client_id', Auth::id())
            ->findOrFail($id);

        return new CommandeResource($commande);
    }

    /**
     * Afficher une commande (Admin)
     */
    public function afficherCommandeAdmin($id)
    {
        $commande = Commande::with(['client', 'commandeProduits.produit'])
            ->findOrFail($id);

        return new CommandeResource($commande);
    }

    /**
     * Mettre à jour le statut d'une commande
     */
    public function mettreAJourStatut($commandeId, $nouveauStatut)
    {
        $statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];

        if (!in_array($nouveauStatut, $statutsValides)) {
            throw new \InvalidArgumentException('Statut invalide');
        }

        $commande = Commande::findOrFail($commandeId);
        $commande->update(['statut' => $nouveauStatut]);

        return new CommandeResource($commande->load(['client', 'commandeProduits.produit']));
    }

    /**
     * Annuler une commande et restaurer le stock
     */
    public function annulerCommande($commandeId)
    {
        DB::beginTransaction();

        try {
            $commande = Commande::with('commandeProduits.produit')->findOrFail($commandeId);

            // Vérifier si la commande peut être annulée
            if (!in_array($commande->statut, ['en_attente', 'confirmee'])) {
                throw new \Exception('Cette commande ne peut plus être annulée');
            }

            // Restaurer le stock
            foreach ($commande->commandeProduits as $commandeProduit) {
                if ($commandeProduit->produit) {
                    $commandeProduit->produit->increment('quantite_stock', $commandeProduit->quantite);
                }
            }

            // Mettre à jour le statut
            $commande->update(['statut' => 'annulee']);



            DB::commit();

            return new CommandeResource($commande->load(['client', 'commandeProduits.produit']));

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }


    // ===== MÉTHODES PRIVÉES =====

    /**
     * Valider les données de la commande
     */
    private function validerDonneesCommande(Request $request)
    {
        $request->validate([
            'mode_paiement' => 'required|in:espece,wave,om',
            'adresse_livraison' => 'required|string|max:500',
            'date_livraison' => 'required|date|after:now',
            'telephone_contact' => 'nullable|string|max:20'
        ]);
    }

    /**
     * Récupérer le panier de la session
     */
    private function obtenirPanier()
    {
        return session()->get('panier', []);
    }

    /**
     * Vérifier que le panier n'est pas vide
     */
    private function verifierPanierNonVide($panier)
    {
        if (empty($panier)) {
            throw new \Exception('Votre panier est vide');
        }
    }

    /**
     * Générer un numéro de commande unique
     */
    private function genererNumeroCommande()
    {
        return 'CMD' . date('Ymd') . str_pad(
                Commande::whereDate('created_at', today())->count() + 1,
                3, '0', STR_PAD_LEFT
            );
    }

    /**
     * Créer une nouvelle commande
     */
    private function creerNouvelleCommande($numeroCommande, $user, Request $request)
    {
        return Commande::create([
            'numero_commande' => $numeroCommande,
            'client_id' => $user->id,
            'statut' => 'en_attente',
            'mode_paiement' => $request->mode_paiement,
            'adresse_livraison' => $request->adresse_livraison,
            'date_livraison' => $request->date_livraison,
            'montant_total' => 0 // Calculé après
        ]);
    }

    /**
     * Traiter tous les articles du panier
     */
    private function traiterArticlesPanier($panier, $commande)
    {
        $totalCommande = 0;
        $articlesCommande = [];

        foreach ($panier as $item) {
            $produit = Produit::findOrFail($item['produit_id']);

            // Vérifications critiques
            $this->verifierDisponibiliteProduit($produit, $item);
            // Appliquer les promotions
            $prixTotalAvecPromo = $this->appliquerPromotions($produit, $item['quantite']);
            $prixUnitaireAvecPromo = $prixTotalAvecPromo / $item['quantite'];
            // Créer l'article de commande
            $articleCommande = $this->creerArticleCommande($commande, $produit, $item, $prixUnitaireAvecPromo);

            // Décrémenter le stock
            $produit->decrement('quantite_stock', $item['quantite']);

            $totalCommande += ($prixUnitaireAvecPromo * $item['quantite']); // Calculer manuellement car computed column pas encore disponible
            $articlesCommande[] = $articleCommande;
        }

        return [
            'total' => $totalCommande,
            'articles' => $articlesCommande
        ];
    }

    /**
     * Vérifier la disponibilité d'un produit
     */
    private function verifierDisponibiliteProduit($produit, $item)
    {
        if (!$produit->actif) {
            throw new \Exception("Le produit '{$produit->nom}' n'est plus disponible");
        }

        if ($produit->quantite_stock < $item['quantite']) {
            throw new \Exception("Stock insuffisant pour '{$produit->nom}'. Stock disponible: {$produit->quantite_stock}");
        }
    }

    /**
     * Créer un article de commande (CommandeProduit)
     */
    private function creerArticleCommande($commande, $produit, $item, $prixUnitaireAvecPromo)
    {
        return CommandeProduit::create([
            'commande_id' => $commande->id,
            'produit_id' => $produit->id,
            'quantite' => $item['quantite'],
//            'prix_unitaire' => $produit->prix, // Prix snapshot actuel
            'prix_unitaire' => $prixUnitaireAvecPromo,
            'sous_total'    => $prixUnitaireAvecPromo * $item['quantite'],
            // sous_total sera calculé automatiquement par la DB (computed column)
        ]);
    }

    /**
     * Créer une facture brouillon
     */
    private function creerFactureBrouillon($commande, $montantTotal)
    {
//        return Facture::create([
//            'numero_facture' => 'FACT' . str_pad($commande->id, 6, '0', STR_PAD_LEFT),
//            'commande_id' => $commande->id,
//            'montant_total' => $montantTotal,
//            'statut' => 'BROUILLON'
//        ]);
    }

    /**
     * Vider le panier de la session
     */
    private function viderPanier()
    {
        session()->forget('panier');
    }

    private function appliquerPromotions(Produit $produit, int $quantite)
    {
        $prixUnitaire = $produit->prix;
        $total = $prixUnitaire * $quantite;

        foreach ($produit->promotions as $promotion) {
            // Vérifier que la promo est active
            if (
                now()->between($promotion->date_debut, $promotion->date_fin)
            ) {
                switch ($promotion->type) {
                    case 'POURCENTAGE':
                        $remise = ($promotion->valeur_remise / 100) * $total;
                        $total -= $remise;
                        break;

                    case 'MONTANT_FIXE':
                        $remise = $promotion->valeur_remise * $quantite;
                        $total -= $remise;
                        break;

                    case 'ACHETEZ_X_OBTENEZ_Y':
                        // Exemple : Achetez 2 obtenez 1 gratuit
                        $x = $promotion->x ?? 0;
                        $y = $promotion->y ?? 0;

                        if ($x > 0 && $y > 0) {
                            $lots = intdiv($quantite, $x + $y);
                            $articlesGratuits = $lots * $y;
                            $payant = $quantite - $articlesGratuits;
                            $total = $payant * $prixUnitaire;
                        }
                        break;
                }
            }
        }

        return max($total, 0); // éviter un prix négatif
    }

}
