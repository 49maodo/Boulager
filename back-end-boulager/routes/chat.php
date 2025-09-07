<?php

use App\Helpers\OpenAIHelper;

Route::middleware(['auth:sanctum'])->group(function () {

    // Routes du chat
    Route::prefix('chat')->group(function () {

        // Démarrer une conversation avec le support IA
        Route::post('/support/start',
            [\App\Http\Controllers\MessagesChatController::class, 'demarrerSupportIA']);

        // Envoyer un message
        Route::post('/messages',
            [\App\Http\Controllers\MessagesChatController::class, 'envoyerMessage']);

        // Récupérer l'historique d'une conversation
        Route::get('/conversation/{destinataire_id}',
            [\App\Http\Controllers\MessagesChatController::class, 'historiqueConversation']);

        // Marquer des messages comme lus
        Route::patch('/messages/mark-read',
            [\App\Http\Controllers\MessagesChatController::class, 'marquerCommeLus']);

        // Obtenir le nombre de messages non lus
        Route::get('/unread-count',
            [\App\Http\Controllers\MessagesChatController::class, 'messagesNonLus']);

        // Obtenir les dernières conversations
        Route::get('/conversations',
            [\App\Http\Controllers\MessagesChatController::class, 'dernieresConversations']);

        // Statistiques OpenAI
        Route::get('/stats', function() {
            return response()->json([
                'stats' => OpenAIHelper::getStats(),
                'config' => [
                    'api_key_set' => !empty(config('services.openai.api_key')),
                    'ai_user_id' => config('services.openai.ai_user_id')
                ]
            ]);
        });

        // Test fallback
        Route::get('fallback/{message}', function($message) {
            // Forcer le fallback
            \Illuminate\Support\Facades\Cache::put('openai_global_blocked', true, 60);

            $response = OpenAIHelper::genererReponse(999, urldecode($message));

            return response()->json([
                'message' => urldecode($message),
                'response' => $response,
                'was_fallback' => true
            ]);
        });

        // Nettoyer les bloquages
        Route::get('/clear', function() {
            OpenAIHelper::clearAllBlocks();
            return response()->json(['status' => 'cleared']);
        });

        // Test API directe
        Route::get('/test-direct', function() {
            try {
                $client = OpenAI::client(config('services.openai.api_key'));

                $response = $client->chat()->create([
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        ['role' => 'user', 'content' => 'Hello']
                    ],
                    'max_tokens' => 50,
                ]);

                return response()->json([
                    'success' => true,
                    'response' => $response->choices[0]->message->content
                ]);

            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage(),
                    'code' => $e->getCode()
                ]);
            }
        });
    });
});

// Route WebSocket pour l'autorisation des canaux privés
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
