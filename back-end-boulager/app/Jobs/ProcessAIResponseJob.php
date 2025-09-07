<?php

namespace App\Jobs;

use App\Helpers\OpenAIHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\MessagesChat;
use App\Services\OpenAIService;
use App\Events\NouveauMessageChatEvent;
use Illuminate\Support\Facades\Log;

class ProcessAIResponseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;
    public $tries = 3;

    protected $messageId;
    protected $userId;
    protected $messageContent;

    /**
     * Create a new job instance.
     */
    public function __construct(int $messageId, int $userId, string $messageContent)
    {
        $this->messageId = $messageId;
        $this->userId = $userId;
        $this->messageContent = $messageContent;

        Log::info('Job ProcessAIResponse créé', [
            'message_id' => $messageId,
            'user_id' => $userId
        ]);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Job ProcessAIResponse démarré', [
            'message_id' => $this->messageId,
            'user_id' => $this->userId
        ]);

        try {
            // Vérifier si le message nécessite une intervention humaine
            if (OpenAIHelper::necessiteInterventionHumaine($this->messageContent)) {
                Log::info('Intervention humaine nécessaire');
                $this->createHumanInterventionMessage();
            } else {
                Log::info('Génération réponse IA');
                $this->generateAIResponse();
            }

            Log::info('Job ProcessAIResponse terminé avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur dans ProcessAIResponse', [
                'message_id' => $this->messageId,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->createFallbackMessage();
        }
    }

    /**
     * Générer une réponse IA
     */
    private function generateAIResponse(): void
    {
        try {
            // Générer la réponse IA
            $reponseIA = OpenAIHelper::genererReponse($this->userId, $this->messageContent);

            if ($reponseIA) {
                $messageAI = MessagesChat::create([
                    'expediteur_id' => config('services.openai.ai_user_id', 1),
                    'destinataire_id' => $this->userId,
                    'contenu' => $reponseIA,
                    'type_message' => 'TEXTE',
                    'is_ai_response' => true,
                    'lu' => false
                ]);

                Log::info('Message IA créé', ['message_id' => $messageAI->id]);

                // Déclencher l'événement WebSocket
                broadcast(new NouveauMessageChatEvent($messageAI))->toOthers();

                Log::info('Événement WebSocket diffusé');
            } else {
                Log::warning('Pas de réponse IA générée');
                $this->createFallbackMessage();
            }

        } catch (\Exception $e) {
            Log::error('Erreur génération IA', [
                'error' => $e->getMessage(),
                'user_id' => $this->userId
            ]);
            $this->createFallbackMessage();
        }
    }

    /**
     * Créer un message pour intervention humaine
     */
    private function createHumanInterventionMessage(): void
    {
        try {
            $messageSysteme = MessagesChat::create([
                'expediteur_id' => config('services.openai.ai_user_id', 1),
                'destinataire_id' => $this->userId,
                'contenu' => 'Votre demande a été transmise à notre équipe support. Un agent vous contactera sous peu pour vous aider.',
                'type_message' => 'SYSTEME',
                'is_ai_response' => true,
                'lu' => false
            ]);

            broadcast(new NouveauMessageChatEvent($messageSysteme))->toOthers();

            Log::info('Message intervention humaine créé');

        } catch (\Exception $e) {
            Log::error('Erreur création message intervention', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Créer un message de fallback en cas d'erreur
     */
    private function createFallbackMessage(): void
    {
        try {
            $messageFallback = MessagesChat::create([
                'expediteur_id' => config('services.openai.ai_user_id', 1),
                'destinataire_id' => $this->userId,
                'contenu' => 'Je ne peux pas répondre actuellement. Notre équipe support a été notifiée et vous contactera bientôt.',
                'type_message' => 'SYSTEME',
                'is_ai_response' => true,
                'lu' => false
            ]);

            broadcast(new NouveauMessageChatEvent($messageFallback))->toOthers();

            Log::info('Message fallback créé');

        } catch (\Exception $e) {
            Log::error('Erreur critique création fallback', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Job ProcessAIResponse échoué définitivement', [
            'message_id' => $this->messageId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage()
        ]);

        $this->createFallbackMessage();
    }
}
