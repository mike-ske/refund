<?php

namespace Tests\Feature;

use App\Models\AdminActivityLog;
use App\Models\Application;
use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_suspend_and_delete_applicant_accounts(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->withToken($admin->createToken('test')->plainTextToken);

        $create = $this->postJson('/api/admin/users', ['name' => 'Jordan Example', 'email' => 'jordan@example.test', 'password' => 'ExamplePassword!']);
        $create->assertCreated()->assertJsonPath('name', 'Jordan Example')->assertJsonPath('role', 'user');
        $id = $create->json('id');
        $this->assertDatabaseHas('users', ['id' => $id, 'email' => 'jordan@example.test', 'is_active' => 1]);

        $this->putJson("/api/admin/users/{$id}", ['name' => 'Jordan Updated', 'email' => 'jordan.updated@example.test', 'password' => 'NewPassword!23'])
            ->assertOk()->assertJsonPath('name', 'Jordan Updated');
        $this->assertDatabaseHas('users', ['id' => $id, 'name' => 'Jordan Updated', 'email' => 'jordan.updated@example.test']);
        $this->assertTrue(Hash::check('NewPassword!23', User::findOrFail($id)->password));

        $this->putJson("/api/admin/users/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('is_active', false);
        $this->assertDatabaseHas('users', ['id' => $id, 'is_active' => 0]);

        $this->deleteJson("/api/admin/users/{$id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $id]);
        $this->assertSame(4, AdminActivityLog::where('entity_type', 'user')->count());
    }

    public function test_user_with_applications_must_be_suspended_or_anonymized_before_deletion(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $user = User::factory()->create(['role' => 'user']);
        $application = Application::create(['user_id' => $user->id, 'reference' => 'ARP-TEST1234', 'first_name' => 'Jamie', 'last_name' => 'Applicant', 'email' => $user->email, 'message' => 'A request that is long enough for validation.', 'status' => 'received']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        $this->deleteJson("/api/admin/users/{$user->id}")->assertStatus(409)->assertJsonPath('code', 'has_applications');
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'user_id' => $user->id]);

        $this->deleteJson("/api/admin/users/{$user->id}?anonymize=1")->assertOk();
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'user_id' => null]);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_staff_can_be_created_edited_and_deactivated_but_last_or_own_admin_is_protected(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->withToken($admin->createToken('test')->plainTextToken);

        $created = $this->postJson('/api/admin/staff', ['name' => 'Second Admin', 'email' => 'second@example.test', 'password' => 'ExamplePassword!']);
        $created->assertCreated()->assertJsonPath('email', 'second@example.test');
        $staffId = $created->json('id');
        $this->putJson("/api/admin/staff/{$staffId}", ['name' => 'Operations Admin'])->assertOk()->assertJsonPath('name', 'Operations Admin');
        $this->putJson("/api/admin/staff/{$staffId}", ['is_active' => false])->assertOk()->assertJsonPath('is_active', false);
        $this->deleteJson("/api/admin/staff/{$staffId}")->assertOk();

        $this->deleteJson("/api/admin/staff/{$admin->id}")->assertStatus(422);
        $this->putJson("/api/admin/staff/{$admin->id}", ['is_active' => false])->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'role' => 'admin', 'is_active' => 1]);
    }

    public function test_non_admin_token_receives_403_from_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $this->withToken($user->createToken('test')->plainTextToken);

        foreach (['dashboard', 'stats', 'applications', 'users', 'payouts', 'emails', 'reports', 'reports/export', 'settings', 'contacts'] as $section) {
            $this->getJson("/api/admin/{$section}")->assertForbidden();
        }
        $this->putJson('/api/admin/settings', ['name' => 'Forbidden'])->assertForbidden();
        $this->postJson('/api/admin/users', ['name' => 'No', 'email' => 'no@example.test', 'password' => 'ExamplePassword!'])->assertForbidden();
        foreach ([
            ['PUT', '/api/admin/applications/1'], ['DELETE', '/api/admin/applications/1'], ['PUT', '/api/admin/users/1'],
            ['DELETE', '/api/admin/users/1'], ['PUT', '/api/admin/payouts/1'], ['PUT', '/api/admin/emails/1'],
            ['POST', '/api/admin/staff'], ['PUT', '/api/admin/staff/1'], ['DELETE', '/api/admin/staff/1'], ['PUT', '/api/admin/contacts/1'],
        ] as [$method, $path]) {
            $this->json($method, $path)->assertForbidden();
        }
    }

    public function test_approval_updates_application_sends_and_logs_email_creates_payout_and_records_activity(): void
    {
        Mail::fake();
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $application = Application::create(['reference' => 'ARP-APPROVE1', 'first_name' => 'Taylor', 'last_name' => 'Applicant', 'email' => 'taylor@example.test', 'message' => 'Please review this allocation request.', 'status' => 'received']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->putJson("/api/admin/applications/{$application->id}", ['status' => 'approved', 'message' => 'Your request has been approved.', 'internal_notes' => 'Verified.'])
            ->assertOk()->assertJsonPath('status', 'approved');

        $this->assertDatabaseHas('applications', ['id' => $application->id, 'status' => 'approved', 'internal_notes' => 'Verified.']);
        $this->assertDatabaseHas('application_events', ['application_id' => $application->id, 'status' => 'approved', 'message' => 'Your request has been approved.']);
        $this->assertDatabaseHas('email_logs', ['application_id' => $application->id, 'template_key' => 'status_update', 'recipient' => 'taylor@example.test', 'status' => 'sent']);
        $this->assertDatabaseHas('payouts', ['application_id' => $application->id, 'status' => 'pending']);
        $this->assertDatabaseHas('admin_activity_logs', ['admin_id' => $admin->id, 'entity_type' => 'application', 'entity_id' => $application->id]);
    }

    public function test_admin_menus_return_real_records_and_settings_persist(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->withToken($admin->createToken('test')->plainTextToken);

        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonStructure(['counts', 'today', 'week', 'oldest_waiting', 'recent_activity', 'payout_totals']);
        $this->getJson('/api/admin/users')->assertOk()->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
        $this->getJson('/api/admin/payouts')->assertOk()->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
        $this->getJson('/api/admin/emails')->assertOk()->assertJsonStructure(['templates', 'logs']);
        $this->getJson('/api/admin/reports')->assertOk()->assertJsonStructure(['weekly', 'total', 'approval_rate', 'rejection_rate', 'average_review_hours']);
        $this->putJson('/api/admin/settings', ['name' => 'Refund Operations', 'operator' => 'Operations', 'phone' => '+12025550100', 'email' => 'help@example.test', 'hours' => 'Weekdays', 'review_time' => '5 days'])->assertOk();
        $this->assertDatabaseHas('program_settings', ['key' => 'program']);
        $this->getJson('/api/program')->assertOk()->assertJsonPath('name', 'Refund Operations');
        $this->getJson('/api/admin/settings')->assertOk()->assertJsonStructure(['program', 'staff', 'activity']);
    }

    public function test_payout_email_template_and_report_export_endpoints_persist_changes(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        Application::create(['reference' => 'ARP-PAYOUT01', 'first_name' => 'Morgan', 'last_name' => 'Example', 'email' => 'morgan@example.test', 'message' => 'Please review this completed request.', 'status' => 'approved']);
        $template = EmailTemplate::create(['key' => 'received', 'subject' => 'Received {{reference}}', 'body' => 'Hello {{name}}']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        $payoutId = $this->getJson('/api/admin/payouts')->assertOk()->json('data.0.id');
        $this->putJson("/api/admin/payouts/{$payoutId}", ['amount' => 485.50, 'status' => 'paid', 'payment_reference' => 'BANK-REF-45', 'paid_at' => '2026-11-01'])
            ->assertOk()->assertJsonPath('status', 'paid');
        $this->assertDatabaseHas('payouts', ['id' => $payoutId, 'amount' => 485.50, 'status' => 'paid', 'payment_reference' => 'BANK-REF-45']);

        $this->putJson("/api/admin/emails/{$template->id}", ['subject' => 'Updated {{reference}}', 'body' => 'Hello {{name}}, status {{status}}'])
            ->assertOk()->assertJsonPath('subject', 'Updated {{reference}}');
        $this->assertDatabaseHas('email_templates', ['id' => $template->id, 'subject' => 'Updated {{reference}}']);

        $this->get('/api/admin/reports/export')->assertOk()->assertHeader('content-type', 'text/csv; charset=utf-8');
    }
}
