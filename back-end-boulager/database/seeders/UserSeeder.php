<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::insert([
            [
                'firstname' => 'Admin',
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'telephone' => '770000000',
                'address' => 'Dakar',
                'role' => 'admin',
                'password' => bcrypt('passer'),
            ],
            [
                'firstname' => 'Employe',
                'name' => 'Employe',
                'email' => 'emp@gmail.com',
                'telephone' => '770000001',
                'address' => 'Dakar',
                'role' => 'employe',
                'password' => bcrypt('passer'),
            ]
        ]);
    }
}
