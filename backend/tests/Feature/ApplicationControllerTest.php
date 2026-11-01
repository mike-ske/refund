<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApplicationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_application_form_accepts_exact_fields_and_links_an_existing_applicant_account(): void
    {
        Mail::fake();
        $user = User::factory()->create(['role' => 'user', 'is_active' => true, 'email' => 'applicant@example.test']);

        $response = $this->postJson('/api/applications', [
            'first_name' => 'Morgan',
            'last_name' => 'Example',
            'email' => 'applicant@example.test',
            'existing_reference' => 'OLD-REF-1',
            'message' => 'Please review my refund application.',
            'consent' => true,
        ]);

        $response->assertCreated()->assertJsonPath('status', 'received')->assertJsonPath('full_name', 'Morgan Example');
        $this->assertDatabaseHas('applications', ['reference' => $response->json('reference'), 'user_id' => $user->id, 'phone' => null]);
        $this->assertDatabaseHas('email_logs', ['application_id' => $response->json('id'), 'template_key' => 'received', 'status' => 'sent']);
    }
}
