<?php

namespace App\Services;

use App\Models\Commande;
use App\Models\Paiement;
use Illuminate\Support\Str;

class PaiementService
{
    /**
     * Simuler un paiement
     */
    public function simulerPaiement(Commande $commande, string $modePaiement, array $detailsPaiement = [])
    {
        // Vérifier si la commande peut être payée
        if (!$commande->peutEtrePaye()) {
            throw new \Exception("Cette commande ne peut pas être payée. Statut actuel: {$commande->statut}");
        }

        // Générer une référence de transaction
        $referenceTransaction = $this->genererReferenceTransaction($modePaiement);

        // Simuler le processus de paiement selon le mode
        $resultatsimulation = $this->simulerProcessusPaiement($modePaiement, $commande->montant_total, $detailsPaiement);

        // Créer l'enregistrement de paiement
        $paiement = Paiement::create([
            'commande_id' => $commande->id,
            'montant' => $commande->montant_total,
            'mode_paiement' => $modePaiement,
            'statut_paiement' => $resultatsimulation['statut'],
            'reference_transaction' => $referenceTransaction,
            'details_reponse' => $resultatsimulation
        ]);

        // Mettre à jour le statut de la commande si le paiement est réussi
        if ($resultatsimulation['statut'] === 'reussi') {
            $commande->update([
                'statut' => 'confirmee',
                'mode_paiement' => $modePaiement
            ]);
        }

        return [
            'paiement' => $paiement,
            'commande' => $commande->fresh(),
            'succes' => $resultatsimulation['statut'] === 'reussi'
        ];
    }

    /**
     * Simuler le processus de paiement selon le mode
     */
    private function simulerProcessusPaiement(string $modePaiement, float $montant, array $details)
    {
        // Simuler un taux de réussite (90% de réussite)
        $reussi = mt_rand(1, 100) <= 90;

        $baseResponse = [
            'montant' => $montant,
            'timestamp' => now()->toISOString(),
            'mode_paiement' => $modePaiement
        ];

        switch ($modePaiement) {
            case 'wave':
                return array_merge($baseResponse, [
                    'statut' => $reussi ? 'reussi' : 'echec',
                    'code_reponse' => $reussi ? 'WAVE_SUCCESS' : 'WAVE_ERROR',
                    'message' => $reussi ? 'Paiement Wave réussi' : 'Erreur de paiement Wave',
                    'numero_wave' => $details['numero_wave'] ?? '77' . mt_rand(1000000, 9999999),
                    'frais' => $montant * 0.01 // 1% de frais
                ]);

            case 'om':
                return array_merge($baseResponse, [
                    'statut' => $reussi ? 'reussi' : 'echec',
                    'code_reponse' => $reussi ? 'OM_SUCCESS' : 'OM_ERROR',
                    'message' => $reussi ? 'Paiement Orange Money réussi' : 'Erreur de paiement Orange Money',
                    'numero_om' => $details['numero_om'] ?? '70' . mt_rand(1000000, 9999999),
                    'frais' => $montant * 0.015 // 1.5% de frais
                ]);

            case 'espece':
                return array_merge($baseResponse, [
                    'statut' => 'reussi', // Toujours réussi pour espèce
                    'code_reponse' => 'CASH_SUCCESS',
                    'message' => 'Paiement en espèce confirmé',
                    'frais' => 0
                ]);

            default:
                throw new \InvalidArgumentException("Mode de paiement non supporté: {$modePaiement}");
        }
    }

    /**
     * Générer une référence de transaction unique
     */
    private function genererReferenceTransaction(string $modePaiement): string
    {
        $prefix = strtoupper(substr($modePaiement, 0, 2));
        return $prefix . '_' . now()->format('Ymd') . '_' . Str::random(8);
    }
}

