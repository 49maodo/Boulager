<?php

namespace App\Observers;

use App\Models\Promotion;
use App\Models\User;
use App\Notifications\PromotionNotification;
use Illuminate\Support\Facades\Bus;

class PromotionObserver
{
    public function created(Promotion $promotion): void
    {
        // User client
        $users = User::where('role', 'client')->get();
        foreach ($users as $user) {
            $user->notify(new PromotionNotification($promotion));
        }
    }

    public function updated(Promotion $promotion): void
    {
        $users = User::where('role', 'client')->get();
        foreach ($users as $user) {
            $user->notify(new PromotionNotification($promotion));
        }
    }
}
