<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('DemoUser!2026');

        for ($number = 1; $number <= 120; $number++) {
            $email = sprintf('demo.user.%03d@gmailer.com', $number);
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => sprintf('Demo Applicant %03d', $number),
                    'password' => $password,
                    'role' => 'user',
                    'is_active' => true,
                ],
            );
        }

        $this->command?->info('Seeded 120 synthetic demo applicant accounts (@gmailer.com).');
    }
}
