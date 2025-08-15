<?php

namespace App\Policies;

use App\Models\categorie;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class categoriePolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        // Allow all users to view any category
        return true;
    }

    public function view(?User $user, categorie $categorie): bool
    {
        // Allow all users to view a specific category
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function update(User $user, categorie $categorie): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function delete(User $user, categorie $categorie): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function restore(User $user, categorie $categorie): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function forceDelete(User $user, categorie $categorie): bool
    {
        return $user->hasRole('admin');
    }
}
