<?php

namespace App\Policies;

use App\Models\Commande;
use App\Models\CommandeProduit;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CommandeProduitPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        // Allow viewing all commande produits if the user is an admin or an employee;
        return $user->hasRole('admin') || $user->hasRole('employe') || $user->hasRole('client');
    }

    public function view(User $user, CommandeProduit $commandeProduit): bool
    {
        return $user->hasRole('admin') || $user->id === $commandeProduit->commande->client_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function update(User $user, CommandeProduit $commandeProduit): bool
    {
        return $user->hasRole('admin') || $user->id === $commandeProduit->commande->client_id;
    }

    public function delete(User $user, CommandeProduit $commandeProduit): bool
    {
        return $user->hasRole('admin') || $user->id === $commandeProduit->commande->client_id;
    }

    public function restore(User $user, CommandeProduit $commandeProduit): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, CommandeProduit $commandeProduit): bool
    {
        return $user->hasRole('admin');
    }
}
