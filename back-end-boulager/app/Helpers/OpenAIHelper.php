<?php

// app/Helpers/OpenAIHelper.php - Version améliorée

namespace App\Helpers;

use OpenAI;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OpenAIHelper
{
    /**
     * Générer une réponse IA avec gestion du rate limiting
     */

    public static function genererReponse(int $userId, string $messageUtilisateur): ?string
    {
        try {
            Log::info('Début génération réponse IA', [
                'user_id' => $userId,
                'message' => $messageUtilisateur
            ]);

            // Vérifier la configuration
            $apiKey = config('services.openai.api_key');
            if (!$apiKey || $apiKey === '*******') {
                Log::error('Clé API OpenAI manquante ou non configurée');
                return "Configuration OpenAI en cours. Notre équipe technique finalise la mise en place du service.";
            }

            // Cache pour éviter les appels répétitifs
            $cacheKey = 'openai_response_' . md5($messageUtilisateur . date('Y-m-d-H'));
            $cachedResponse = Cache::get($cacheKey);

            if ($cachedResponse) {
                Log::info('Réponse trouvée en cache');
                return $cachedResponse;
            }

            // Vérifier le rate limit global
            $globalRateKey = 'openai_global_rate_' . date('Y-m-d-H-i');
            $globalCount = Cache::get($globalRateKey, 0);

            if ($globalCount >= 2) { // Très conservateur : 2 appels par minute max
                Log::warning('Rate limit global préventif', [
                    'global_count' => $globalCount,
                    'minute' => date('Y-m-d-H-i')
                ]);
                return self::getFallbackResponse($messageUtilisateur);
            }

            // Essayer l'appel OpenAI avec des paramètres très conservateurs
            Log::info('Tentative appel OpenAI conservatif...');

            $client = OpenAI::client($apiKey);

            // Messages simplifiés
            $messages = [
                [
                    'role' => 'system',
                    'content' => 'Tu es un assistant support. Réponds très brièvement en français.'
                ],
                [
                    'role' => 'user',
                    'content' => substr($messageUtilisateur, 0, 100) // Limiter la taille
                ]
            ];

            // Paramètres très conservateurs
            $response = $client->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => $messages,
                'max_tokens' => 100, // Très faible
                'temperature' => 0.3, // Très déterministe
            ]);

            $reponse = $response->choices[0]->message->content ?? null;

            if ($reponse) {
                // Incrémenter APRÈS succès
                Cache::put($globalRateKey, $globalCount + 1, 60);

                // Cache plus long pour réduire les appels
                Cache::put($cacheKey, $reponse, 1800); // 30 minutes

                Log::info('Réponse OpenAI réussie', [
                    'response_length' => strlen($reponse),
                    'global_count' => $globalCount + 1
                ]);

                return $reponse;
            }

            return self::getFallbackResponse($messageUtilisateur);

        } catch (\Exception $e) {
            Log::error('Erreur OpenAI complète', [
                'user_id' => $userId,
                'message' => $messageUtilisateur,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);

            return self::handleOpenAIError($e, $userId, $messageUtilisateur);
        }
    }

    private static function getFallbackResponse(string $message): string
    {
        $messageLower = strtolower($message);

        // Détection de patterns pour réponses intelligentes
        if (strpos($messageLower, 'bonjour') !== false || strpos($messageLower, 'salut') !== false || strpos($messageLower, 'slt') !== false) {
            return "Bonjour ! Je suis votre assistant support. Comment puis-je vous aider aujourd'hui ? 😊";
        }

        if (strpos($messageLower, 'problème') !== false || strpos($messageLower, 'bug') !== false) {
            return "Je comprends que vous rencontrez un problème. Pouvez-vous me donner plus de détails ? Notre équipe technique est également disponible pour vous aider.";
        }

        if (strpos($messageLower, 'commande') !== false || strpos($messageLower, 'livraison') !== false) {
            return "Pour les questions concernant vos commandes et livraisons, je vous recommande de contacter notre service client qui pourra accéder à vos informations personnelles.";
        }

        if (strpos($messageLower, 'prix') !== false || strpos($messageLower, 'coût') !== false || strpos($messageLower, 'tarif') !== false) {
            return "Pour les informations tarifaires actualisées, je vous invite à consulter notre site web ou contacter notre équipe commerciale qui pourra vous renseigner précisément.";
        }

        if (strpos($messageLower, 'merci') !== false) {
            return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions. 😊";
        }

        if (strpos($messageLower, 'au revoir') !== false || strpos($messageLower, 'bye') !== false) {
            return "Au revoir et bonne journée ! N'hésitez pas à revenir si vous avez besoin d'aide. 👋";
        }

        // Réponse par défaut
        return "Merci pour votre message. Pour vous offrir la meilleure assistance possible, un membre de notre équipe support va prendre en charge votre demande. Vous recevrez une réponse personnalisée sous peu. 💬";
    }

    /**
     * Gérer les erreurs OpenAI avec messages appropriés
     */
    private static function handleOpenAIError(\Exception $e, int $userId, string $messageUtilisateur): string
    {
        $errorMessage = $e->getMessage();

        if (strpos($errorMessage, 'rate limit') !== false) {
            // Marquer globalement pour éviter d'autres appels
            Cache::put('openai_global_blocked', true, 300); // 5 minutes

            Log::warning('Rate limit OpenAI détecté, utilisation du fallback intelligent');
            return self::getFallbackResponse($messageUtilisateur);
        }

        if (strpos($errorMessage, 'API key') !== false) {
            Log::error('Problème clé API OpenAI');
            return "Service temporairement indisponible. Notre équipe technique travaille à résoudre ce problème. En attendant, notre support humain peut vous aider ! 🔧";
        }

        if (strpos($errorMessage, 'quota') !== false || strpos($errorMessage, 'billing') !== false) {
            Log::error('Problème quota/billing OpenAI');
            Cache::put('openai_global_blocked', true, 3600); // 1 heure
            return "Notre service IA est temporairement suspendu pour maintenance. Notre équipe support humain prend le relais pour vous assister ! 👤";
        }

        // Erreur générale
        return self::getFallbackResponse($messageUtilisateur);
    }

    /**
     * Vérifier si OpenAI est actuellement rate limited
     */
    public static function isRateLimited(): bool
    {
        return Cache::has('openai_rate_limited');
    }

    /**
     * Vérifier si OpenAI est bloqué
     */
    public static function isBlocked(): bool
    {
        return Cache::has('openai_global_blocked');
    }

    /**
     * Vérifier si intervention humaine nécessaire
     */
    public static function necessiteInterventionHumaine(string $message): bool
    {
        // Si OpenAI est bloqué, toujours passer en humain pour les cas complexes
        if (self::isBlocked()) {
            // Mais utiliser le fallback intelligent pour les cas simples
            $messageLower = strtolower($message);
            $motsSimples = ['bonjour', 'salut', 'slt', 'merci', 'au revoir', 'bye'];

            foreach ($motsSimples as $mot) {
                if (strpos($messageLower, $mot) !== false) {
                    return false; // Utiliser le fallback
                }
            }

            return true; // Passer en humain pour le reste
        }

        $motsClesUrgents = [
            'urgent', 'problème grave', 'bug critique',
            'remboursement', 'annulation', 'réclamation',
            'manager', 'responsable', 'plainte', 'insatisfait',
            'avocat', 'tribunal', 'juridique', 'facturation'
        ];

        $messageLower = strtolower($message);

        foreach ($motsClesUrgents as $motCle) {
            if (strpos($messageLower, $motCle) !== false) {
                Log::info('Mot-clé urgent détecté', ['keyword' => $motCle]);
                return true;
            }
        }

        return false;
    }

    /**
     * Obtenir le prompt système
     */
    private static function getSystemPrompt(): string
    {
        return "Tu es un assistant support client amical et professionnel.

        Règles importantes :
        - Réponds en français de manière concise (max 100 mots)
        - Sois poli et empathique
        - Si tu ne peux pas aider précisément, recommande le support humain
        - Pour les questions techniques complexes, dirige vers l'équipe technique
        - Utilise des emojis occasionnellement pour rendre la conversation plus chaleureuse

        Tu peux aider avec :
        - Questions générales sur les produits
        - Problèmes techniques simples
        - Guidance et orientation
        - Information sur les processus

        Évite de :
        - Donner des informations sur les prix sans vérification
        - Promettre des remboursements ou modifications de compte
        - Traiter les réclamations complexes (transfert vers humain)";
    }

    /**
     * Nettoyer les caches en cas de besoin
     */
    public static function clearRateLimit(): void
    {
        foreach (range(0, 59) as $minute) {
            $key = 'openai_rate_limit_' . date('Y-m-d-H') . '-' . str_pad($minute, 2, '0', STR_PAD_LEFT);
            Cache::forget($key);
        }

        Log::info('Tous les caches rate limit OpenAI ont été nettoyés');
    }

    public static function getStats(): array
    {
        return [
            'global_blocked' => self::isBlocked(),
            'current_minute_calls' => Cache::get('openai_global_rate_' . date('Y-m-d-H-i'), 0),
            'api_key_configured' => !empty(config('services.openai.api_key')) && config('services.openai.api_key') !== '*******'
        ];
    }

    /**
     * Nettoyer tous les bloquages (pour debug)
     */
    public static function clearAllBlocks(): void
    {
        Cache::forget('openai_global_blocked');
        Cache::forget('openai_global_rate_' . date('Y-m-d-H-i'));
        Log::info('Tous les bloquages OpenAI ont été nettoyés');
    }
}
