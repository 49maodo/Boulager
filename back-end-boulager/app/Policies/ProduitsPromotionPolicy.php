<?php

namespace App\Policies;

use App\Models\ProduitsPromotion;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProduitsPromotionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProduitsPromotion $produitsPromotion): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function update(User $user, ProduitsPromotion $produitsPromotion): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function delete(User $user, ProduitsPromotion $produitsPromotion): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function restore(User $user, ProduitsPromotion $produitsPromotion): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, ProduitsPromotion $produitsPromotion): bool
    {
        return $user->hasRole('admin');
    }
}
