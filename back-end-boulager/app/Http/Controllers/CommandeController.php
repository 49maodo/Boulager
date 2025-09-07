<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommandeRequest;
use App\Http\Requests\CommandeRequestUpdate;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function __construct(private CommandeService $commandeService){}

    /**
     * Afficher la liste des commandes
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Commande::class);

//        return CommandeResource::collection(Commande::all());
        try {
            $perPage = $request->get('per_page', 10);

            // Si l'utilisateur est admin/employé, afficher toutes les commandes
            // Sinon, afficher seulement ses commandes
            if (auth()->user()->hasRole('admin') || auth()->user()->hasRole('employe')) {
                $commandes = $this->commandeService->obtenirToutesCommandes($perPage);
            } else {
                $commandes = $this->commandeService->obtenirCommandesUtilisateur($perPage);
            }

            return response()->json([
                'success' => true,
                'message' => 'Commandes récupérées avec succès',
                'data' => $commandes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle commande à partir du panier
     */
    public function store(CommandeRequest $request)
    {
        $this->authorize('create', Commande::class);
        try {
            $result = $this->commandeService->creerCommande($request);

            return response()->json($result, 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Afficher une commande spécifique
     */
    public function show(int $id)
    {
//        $this->authorize('view', $commande);

//        return new CommandeResource($commande);
        try {
            $commande = Commande::findOrFail($id);
            $this->authorize('view', $commande);

            // Utiliser la méthode appropriée selon le rôle
            if (auth()->user()->hasRole('admin') || auth()->user()->hasRole('employe')) {
                $commandeResource = $this->commandeService->afficherCommandeAdmin($id);
            } else {
                $commandeResource = $this->commandeService->afficherCommande($id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Commande récupérée avec succès',
                'data' => $commandeResource
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour le statut d'une commande (Admin/Employé uniquement)
     */
    public function update(CommandeRequestUpdate $request, int $id)
    {
        try {
            $commande = Commande::findOrFail($id);
            $this->authorize('update', $commande);
            // Seuls les admins et employés peuvent changer le statut
            if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('employe')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Action non autorisée'
                ], 403);
            }

            $request->validate([
                'statut' => 'required|string|in:en_attente,confirmee,en_preparation,en_livraison,livree,annulee'
            ]);

            $commandeResource = $this->commandeService->mettreAJourStatut($id, $request->statut);

            return response()->json([
                'success' => true,
                'message' => 'Statut de la commande mis à jour avec succès',
                'data' => $commandeResource
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Statut invalide',
                'error' => $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler une commande
     */
    public function cancel(int $id): JsonResponse
    {
        try {
            $commande = Commande::findOrFail($id);
            $this->authorize('update', $commande);

            $commandeResource = $this->commandeService->annulerCommande($id);

            // update stock for each product in the cancelled order
            foreach ($commande->produits as $produit) {
                $produit->quantite_stock += $produit->pivot->quantite;
                $produit->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Commande annulée avec succès',
                'data' => $commandeResource
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de la commande',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Supprimer une commande (soft delete)
     */
    public function destroy(int $id)
    {
        try {
            $commande = Commande::findOrFail($id);
            $this->authorize('delete', $commande);

            // Vérifier que la commande peut être supprimée
            if (!in_array($commande->statut, ['annulee'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les commandes annulées peuvent être supprimées'
                ], 400);
            }

            $commande->delete();

            return response()->json([
                'success' => true,
                'message' => 'Commande supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
