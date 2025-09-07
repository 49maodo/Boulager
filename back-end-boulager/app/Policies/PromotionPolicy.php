<?php

namespace App\Policies;

use App\Models\Promotion;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PromotionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Promotion $promotion): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function update(User $user, Promotion $promotion): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function delete(User $user, Promotion $promotion): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employe');
    }

    public function restore(User $user, Promotion $promotion): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, Promotion $promotion): bool
    {
        return $user->hasRole('admin');
    }
}
