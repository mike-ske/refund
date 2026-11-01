<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $pw = env('ADMIN_PASSWORD');
        if (! $email || ! $pw) {
            $this->command?->error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');

            return;
        }
        User::updateOrCreate(['email' => $email], ['name' => 'Admin', 'password' => Hash::make($pw), 'role' => 'admin', 'is_active' => true]);
    }
}
