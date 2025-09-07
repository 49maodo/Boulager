<?php

namespace App\Events;

use App\Models\MessagesChat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouveauMessageChatEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public MessagesChat $message;

    /**
     * Create a new event instance.
     */
    public function __construct(MessagesChat $message)
    {
        $this->message = $message->load(['expediteur:id,firstname,name', 'destinataire:id,firstname,name']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->destinataire_id),
            new PrivateChannel('chat.' . $this->message->expediteur_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'nouveau.message';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'expediteur_id' => $this->message->expediteur_id,
                'destinataire_id' => $this->message->destinataire_id,
                'contenu' => $this->message->contenu,
                'type_message' => $this->message->type_message,
                'lu' => $this->message->lu,
                'is_ai_response' => $this->message->is_ai_response,
                'created_at' => $this->message->created_at,
                'expediteur' => $this->message->expediteur,
                'destinataire' => $this->message->destinataire,
            ]
        ];
    }
}
