<?php

namespace App\Notifications;

use App\Models\Promotion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PromotionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Promotion $promotion;

    public function __construct(Promotion $promotion)
    {
        $this->promotion = $promotion;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Nouvelle promotion : {$this->promotion->nom}")
            ->greeting("Bonjour {$notifiable->firstname} {$notifiable->name},")
            ->line("Nous avons une nouvelle promotion 🎉")
            ->line("**Promotion :** {$this->promotion->nom}")
            ->line("**Description :** {$this->promotion->description}")
            ->line("**Type :** {$this->promotion->type}")
            ->line("**Valeur remise :** " .
                ($this->promotion->type === 'POURCENTAGE'
                    ? "{$this->promotion->valeur_remise}%"
                    : "{$this->promotion->valeur_remise} XOF"))
            ->line("**Période :** du {$this->promotion->date_debut->format('d/m/Y')} au {$this->promotion->date_fin->format('d/m/Y')}")
            ->line("Les produits éligibles à cette promotion bénéficieront automatiquement de la remise lors de votre prochaine commande.")
            ->line("")
            ->line("Ne ratez pas cette offre !");
    }

    public function toArray($notifiable): array
    {
        return [];
    }
}
