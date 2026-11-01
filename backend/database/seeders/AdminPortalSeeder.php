<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\ProgramSetting;
use Illuminate\Database\Seeder;

class AdminPortalSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['key' => 'received', 'subject' => 'We received your application {{reference}}', 'body' => "Hello {{name}},\n\nWe received your application. Your reference is {{reference}}. You can check its progress using the application status page."],
            ['key' => 'status_update', 'subject' => 'Update on application {{reference}}', 'body' => "Hello {{name}},\n\nThe status of your application {{reference}} is {{status}}.\n\n{{message}}"],
        ] as $template) {
            EmailTemplate::updateOrCreate(['key' => $template['key']], $template);
        }
        ProgramSetting::updateOrCreate(['key' => 'program'], ['value' => ['name' => config('program.name'), 'operator' => config('program.operator'), 'phone' => config('program.phone'), 'email' => config('program.email'), 'hours' => config('program.hours'), 'review_time' => config('program.review_time')]]);
    }
}
