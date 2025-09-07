<?php

namespace App\Policies;

use App\Models\Commande;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CommandePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        // Allow viewing all commandes if the user is an admin or an employee
        return true;
    }

    public function view(User $user, Commande $commande): bool
    {
        // Check if the user is the client of the commande or has an admin role
        return $user->id === $commande->client_id || $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function create(User $user): bool
    {
        // Allow creation if the user is a client
        return $user->hasRole('client');
    }

    public function update(User $user, Commande $commande): bool
    {
        // Allow update if the user is the client of the commande or has an admin role
        return $user->id === $commande->client_id || $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function delete(User $user, Commande $commande): bool
    {
        // Allow deletion if the user is the client of the commande or has an admin role
        return $user->id === $commande->client_id || $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function restore(User $user, Commande $commande): bool
    {
        // Allow restore if the user has an admin role
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, Commande $commande): bool
    {
        // Allow force to delete it if the user has an admin role
        return $user->hasRole('admin');
    }
}
