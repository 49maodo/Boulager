<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordNotification extends Notification
{
    public function __construct(public string $password)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre compte a été créé')
            ->greeting('Bonjour ' . $notifiable->firstname . ' ' . $notifiable->name)
            ->line('Votre compte a été créé avec succès.')
            ->line('Email : ' . $notifiable->email)
            ->line('Mot de passe : ' . $this->password)
            ->line('Merci d’utiliser notre plateforme.')
            ->salutation('Cordialement, l’équipe Boulanger.');
    }

    public function toArray($notifiable): array
    {
        return [];
    }
}
