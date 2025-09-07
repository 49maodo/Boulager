<?php

namespace App\Services;

use OpenAI;
use App\Models\MessagesChat;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private $aiUserId; // ID de l'utilisateur IA dans votre système

    public function __construct()
    {
        $this->aiUserId = config('services.openai.ai_user_id', 1); // ID du bot IA
    }

    /**
     * Obtenir le client OpenAI (créé à la demande pour éviter les problèmes de sérialisation)
     */
    private function getClient()
    {
        return OpenAI::client(config('services.openai.api_key'));
    }

    /**
     * Générer une réponse IA basée sur l'historique de conversation
     */
    public function genererReponse(int $userId, string $messageUtilisateur): ?string
    {
        try {
            // Récupérer l'historique de conversation récent
            $historiqueMessages = $this->recupererHistoriqueConversation($userId);

            // Préparer les messages pour OpenAI
            $messages = $this->preparerMessagesIA($historiqueMessages, $messageUtilisateur);

            $response = $this->getClient()->chat()->create([
                'model' => 'gpt-3.5-turbo',
//                'model' => 'gpt-4.1',
                'messages' => $messages,
//                'max_tokens' => 500,
//                'temperature' => 0.7,
//                'system_fingerprint' => null,
            ]);

            return $response->choices[0]->message->content ?? null;

        } catch (\Exception $e) {
            Log::error('Erreur OpenAI: ' . $e->getMessage());
            return "Je suis désolé, je ne peux pas répondre pour le moment. Veuillez contacter notre équipe support.";
        }
    }

    /**
     * Analyser si le message nécessite une intervention humaine
     */
    public function necessiteInterventionHumaine(string $message): bool
    {
        $motsClesUrgents = [
            'urgent', 'problème grave', 'bug critique', 'ne fonctionne pas',
            'remboursement', 'annulation', 'réclamation', 'insatisfait',
            'manager', 'responsable', 'superviseur'
        ];

        $messageLower = strtolower($message);

        foreach ($motsClesUrgents as $motCle) {
            if (strpos($messageLower, $motCle) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Récupérer l'historique de conversation récent
     */
    private function recupererHistoriqueConversation(int $userId): array
    {
        return MessagesChat::conversation($userId, $this->aiUserId)
            ->latest()
            ->limit(10)
            ->get()
            ->reverse()
            ->values()
            ->toArray();
    }

    /**
     * Préparer les messages pour l'API OpenAI
     */
    private function preparerMessagesIA(array $historique, string $nouveauMessage): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => $this->getSystemPrompt()
            ]
        ];

        // Ajouter l'historique
        foreach ($historique as $msg) {
            $role = $msg['is_ai_response'] ? 'assistant' : 'user';
            $messages[] = [
                'role' => $role,
                'content' => $msg['contenu']
            ];
        }

        // Ajouter le nouveau message
        $messages[] = [
            'role' => 'user',
            'content' => $nouveauMessage
        ];

        return $messages;
    }

    /**
     * Prompt système pour définir le comportement de l'IA
     */
    private function getSystemPrompt(): string
    {
        return "Tu es un assistant de support client professionnel et serviable.
        Tes responsabilités:
        - Répondre aux questions sur les produits avec précision
        - Aider avec les problèmes techniques basiques
        - Guider les utilisateurs vers les bonnes ressources
        - Être poli, patient et compréhensif
        - Si tu ne connais pas la réponse, recommande de contacter l'équipe support
        - Garde tes réponses concises mais complètes
        - Utilise un ton professionnel mais chaleureux

        Si la demande semble urgente ou complexe, recommande de contacter un agent humain.";
    }

    /**
     * Envoyer une réponse IA automatique
     */
    public function envoyerReponseAutomatique(int $userId, string $messageUtilisateur): ?MessagesChat
    {
        $reponseIA = $this->genererReponse($userId, $messageUtilisateur);

        if ($reponseIA) {
            return MessagesChat::create([
                'expediteur_id' => $this->aiUserId,
                'destinataire_id' => $userId,
                'contenu' => $reponseIA,
                'type_message' => 'TEXTE',
                'is_ai_response' => true,
                'lu' => false
            ]);
        }

        return null;
    }
}
