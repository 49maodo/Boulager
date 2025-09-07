<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaiementRequest;
use App\Models\Paiement;
use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Services\PaiementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaiementController extends Controller
{
    protected PaiementService $paiementService;

    public function __construct(PaiementService $paiementService)
    {
        $this->paiementService = $paiementService;
    }

    /**
     * Simuler un paiement pour une commande
     */
    public function simulerPaiement(Request $request, Commande $commande): JsonResponse
    {
        $request->validate([
            'mode_paiement' => 'required|in:wave,om,espece',
            'numero_wave' => 'required_if:mode_paiement,wave|string|min:9',
            'numero_om' => 'required_if:mode_paiement,om|string|min:9',
        ]);

        try {
            $detailsPaiement = [];

            // Récupérer les détails selon le mode de paiement
            if ($request->mode_paiement === 'wave') {
                $detailsPaiement['numero_wave'] = $request->numero_wave;
            } elseif ($request->mode_paiement === 'om') {
                $detailsPaiement['numero_om'] = $request->numero_om;
            }

            $resultat = $this->paiementService->simulerPaiement(
                $commande,
                $request->mode_paiement,
                $detailsPaiement
            );

            return response()->json([
                'success' => true,
                'message' => $resultat['succes'] ? 'Paiement traité avec succès' : 'Échec du paiement',
                'data' => [
                    'paiement' => $resultat['paiement'],
                    'commande' => $resultat['commande'],
                    'statut_paiement' => $resultat['paiement']->statut_paiement,
                    'nouveau_statut_commande' => $resultat['commande']->statut
                ]
            ], $resultat['succes'] ? 200 : 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtenir l'historique des paiements d'une commande
     */
    public function historiquePaiements(Commande $commande): JsonResponse
    {
        $paiements = $commande->paiements()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'commande' => $commande,
                'paiements' => $paiements,
                'total_paiements' => $paiements->count(),
                'total_montant_paye' => $paiements->where('statut_paiement', 'reussi')->sum('montant')
            ]
        ]);
    }
}
