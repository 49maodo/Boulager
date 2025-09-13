<?php

namespace App\Observers;

use App\Models\Commande;
use App\Notifications\UpdateCommandeNotification;

class CommandeObserver
{

    public function created(Commande $commande): void
    {
        // On envoie la notification au client lié à la commande
    }
    public function updated(Commande $commande): void{
        if($commande->wasChanged('statut')) {
            $commande->client->notify(new UpdateCommandeNotification($commande));
        }
    }
}
