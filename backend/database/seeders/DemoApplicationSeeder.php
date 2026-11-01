<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\ApplicationEvent;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['received', 'under_review', 'needs_info', 'approved', 'rejected'];
        $applicant = User::where('role', 'user')->first();
        for ($index = 1; $index <= 12; $index++) {
            $status = $statuses[($index - 1) % count($statuses)];
            $application = Application::firstOrCreate(['reference' => sprintf('ARP-DEMO%04d', $index)], [
                'user_id' => $applicant?->id,
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => sprintf('demo.applicant.%02d@example.test', $index),
                'existing_reference' => null,
                'message' => 'Demo request for evaluating the application review workflow.',
                'status' => $status,
            ]);
            ApplicationEvent::firstOrCreate(['application_id' => $application->id, 'status' => $status], ['message' => 'Demo application record.']);
            if ($status === 'approved') {
                $application->payout()->firstOrCreate([], ['status' => 'pending', 'amount' => 1250]);
            }
        }
    }
}
