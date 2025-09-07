<?php

namespace App\Http\Controllers;

use App\Events\NouveauMessageChatEvent;
use App\Http\Requests\MessagesChatRequest;
use App\Jobs\ProcessAIResponseJob;
use App\Models\MessagesChat;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Events\NouveauMessagesChatEvent as NouveauMessagesChat;;


class MessagesChatController extends Controller
{
    private OpenAIService $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    /**
     * Récupérer l'historique de conversation
     */
    public function historiqueConversation(Request $request, int $destinataireId): JsonResponse
    {
        $userId = Auth::id();

        $messages = MessagesChat::conversation($userId, $destinataireId)
            ->with(['expediteur:id,name', 'destinataire:id,name'])
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Envoyer un nouveau message
     */
    public function envoyerMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'destinataire_id' => 'required|integer|exists:users,id',
            'contenu' => 'required|string|max:5000',
            'type_message' => 'in:TEXTE,IMAGE,SYSTEME'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Créer le message utilisateur
            $message = MessagesChat::create([ // Changé MessagesChat -> MessageChat
                'expediteur_id' => Auth::id(),
                'destinataire_id' => $request->destinataire_id,
                'contenu' => $request->contenu,
                'type_message' => $request->type_message ?? 'TEXTE',
                'lu' => false
            ]);

            // Log pour debug
            Log::info('Message créé', [
                'message_id' => $message->id,
                'expediteur_id' => $message->expediteur_id,
                'destinataire_id' => $message->destinataire_id
            ]);

            // Déclencher l'événement pour WebSocket
            broadcast(new NouveauMessageChatEvent($message))->toOthers(); // Changé le nom de l'event

            // Si c'est un message vers l'IA (support), générer une réponse automatique
            $aiUserId = config('services.openai.ai_user_id', 1);

            Log::info('Vérification IA', [
                'destinataire_id' => $request->destinataire_id,
                'ai_user_id' => $aiUserId,
                'is_ai_message' => $request->destinataire_id == $aiUserId
            ]);

            if ($request->destinataire_id == $aiUserId) {
                Log::info('Traitement message IA commencé');
                $this->traiterMessageSupport($message);
            }

            return response()->json([
                'success' => true,
                'data' => $message->load(['expediteur:id,name', 'destinataire:id,name']),
                'message' => 'Message envoyé avec succès'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur envoi message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi du message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer des messages comme lus
     */
    public function marquerCommeLus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer|exists:messages_chat,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            MessagesChat::whereIn('id', $request->message_ids)
                ->where('destinataire_id', Auth::id())
                ->update(['lu' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Messages marqués comme lus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Obtenir le nombre de messages non lus
     */
    public function messagesNonLus(): JsonResponse
    {
        $count = MessagesChat::nonLus(Auth::id())->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count
            ]
        ]);
    }

    /**
     * Obtenir les dernières conversations
     */
    public function dernieresConversations(): JsonResponse
    {
        $userId = Auth::id();

        // Récupérer les derniers messages de chaque conversation
        $conversations = MessagesChat::select('messages_chat.*')
            ->where(function ($query) use ($userId) {
                $query->where('expediteur_id', $userId)
                    ->orWhere('destinataire_id', $userId);
            })
            ->with(['expediteur:id,name,avatar', 'destinataire:id,name,avatar'])
            ->latest()
            ->get()
            ->groupBy(function ($message) use ($userId) {
                return $message->expediteur_id == $userId ?
                    $message->destinataire_id : $message->expediteur_id;
            })
            ->map(function ($messages) {
                return $messages->first();
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Traiter un message de support avec IA
     */
    private function traiterMessageSupport($message): void
    {
        try {
            Log::info('Dispatch du job IA', [
                'message_id' => $message->id,
                'user_id' => $message->expediteur_id,
                'content' => $message->contenu
            ]);

            // Utiliser un Job pour traiter la réponse IA de manière asynchrone
            ProcessAIResponseJob::dispatch($message->id, $message->expediteur_id, $message->contenu)
                ->delay(now()->addSeconds(2)); // Délai de 2 secondes pour simuler un temps de réflexion

            Log::info('Job IA dispatché avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur traitement message support', [
                'error' => $e->getMessage(),
                'message_id' => $message->id
            ]);

            // Fallback : créer directement une réponse d'erreur
            $this->createFallbackResponse($message);
        }
    }

    /**
     * Démarrer une conversation avec le support IA
     */
    public function demarrerSupportIA(): JsonResponse
    {
        $aiUserId = config('services.openai.ai_user_id', 1);
        $userId = Auth::id();

        // Vérifier s'il existe déjà une conversation
        $conversationExiste = MessagesChat::conversation($userId, $aiUserId)->exists();

        if (!$conversationExiste) {
            // Créer un message de bienvenue
            $messageBienvenue = MessagesChat::create([
                'expediteur_id' => $aiUserId,
                'destinataire_id' => $userId,
                'contenu' => 'Bonjour ! Je suis votre assistant support. Comment puis-je vous aider aujourd\'hui ?',
                'type_message' => 'SYSTEME',
                'is_ai_response' => true,
                'lu' => false
            ]);

            broadcast(new NouveauMessageChatEvent($messageBienvenue));
        }

        return response()->json([
            'success' => true,
            'data' => [
                'ai_user_id' => $aiUserId,
                'conversation_exists' => $conversationExiste
            ],
            'message' => 'Conversation de support initialisée'
        ]);
    }

    /**
     * Créer une réponse de fallback en cas d'erreur
     */
    private function createFallbackResponse($originalMessage): void
    {
        try {
            $fallbackMessage = MessagesChat::create([
                'expediteur_id' => config('services.openai.ai_user_id', 1),
                'destinataire_id' => $originalMessage->expediteur_id,
                'contenu' => 'Je suis désolé, je ne peux pas répondre pour le moment. Notre équipe support a été notifiée et vous contactera bientôt.',
                'type_message' => 'SYSTEME',
                'is_ai_response' => true,
                'lu' => false
            ]);

            broadcast(new NouveauMessageChatEvent($fallbackMessage))->toOthers();

        } catch (\Exception $e) {
            Log::error('Erreur création fallback', ['error' => $e->getMessage()]);
        }
    }
}
