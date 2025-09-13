<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UpdateCommandeNotification extends Notification
{
    public function __construct(Commande $commande)
    {
        $this->commande = $commande;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Mise à jour de votre commande #{$this->commande->numero_commande}")
            ->greeting("Bonjour {$this->commande->client->firstname} {$this->commande->client->name},")
            ->line("Le statut de votre commande a été mis à jour.")
            ->line("**Numéro commande :** {$this->commande->numero_commande}")
            ->line("**Nouveau statut :** {$this->commande->statut}")
            ->line("**Montant total :** {$this->commande->montant_total} XOF")
            ->line("")
            ->line("Merci pour votre confiance et à bientôt !");
    }

    public function toArray($notifiable): array
    {
        return [
            'commande_id' => $this->commande->id,
            'statut' => $this->commande->statut,
        ];
    }
}
