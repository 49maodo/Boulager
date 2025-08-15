<?php

namespace App\Policies;

use App\Models\produit;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class produitPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, produit $produit): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function update(User $user, produit $produit): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function delete(User $user, produit $produit): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function restore(User $user, produit $produit): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, produit $produit): bool
    {
        return $user->hasRole('admin');
    }
}
