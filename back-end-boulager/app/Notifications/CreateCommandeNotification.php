<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreateCommandeNotification extends Notification
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
        $mail = (new MailMessage)
            ->subject("Facture de votre commande #{$this->commande->numero_commande}")
            ->greeting("Bonjour {$this->commande->client->firstname} {$this->commande->client->name},")
            ->line("Merci pour votre commande ! Voici les détails :")
            ->line("**Numéro commande :** {$this->commande->numero_commande}")
            ->line("**Statut :** {$this->commande->statut}")
            ->line("**Mode de paiement :** {$this->commande->mode_paiement}")
            ->line("**Adresse de livraison :** {$this->commande->adresse_livraison}")
            ->line("**Date de livraison prévue :** {$this->commande->date_livraison}")
            ->line("")
            ->line("### Articles commandés :");

        foreach ($this->commande->commandeProduits as $article) {
            $produit = $article->produit; // relation dans CommandeProduit
            $mail->line("- {$produit->nom} ({$article->quantite} × {$article->prix_unitaire} XOF) = {$article->sous_total} XOF");
        }

        $mail->line("")
            ->line("**Montant total : {$this->commande->montant_total} XOF**");

        return $mail;
    }

    public function toArray($notifiable): array
    {
        return [
            'commande_id' => $this->commande->id,
            'numero_commande' => $this->commande->numero_commande,
            'montant_total' => $this->commande->montant_total,
        ];
    }
}
