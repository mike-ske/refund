<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Application;
use App\Models\Payout;
use App\Services\ProgramMailer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    private const STAFF = ['internal_notes', 'ip'];

    public function index(Request $r)
    {
        return Application::query()
            ->when($r->status, fn ($q, $s) => $q->where('status', $s))
            ->when($r->q, fn ($q, $s) => $q->where(fn ($w) => $w->where('reference', 'like', "%$s%")->orWhere('email', 'like', "%$s%")
                ->orWhere('first_name', 'like', "%$s%")->orWhere('last_name', 'like', "%$s%")))
            ->when(in_array($r->input('sort'), ['reference', 'first_name', 'last_name', 'email', 'status', 'created_at'], true), fn ($q) => $q->orderBy($r->input('sort'), $r->input('direction') === 'asc' ? 'asc' : 'desc'), fn ($q) => $q->latest())
            ->paginate(20);
    }

    public function stats()
    {
        return ['counts' => Application::selectRaw('status, count(*) c')->groupBy('status')->pluck('c', 'status')];
    }

    public function show(Application $application)
    {
        return $application->load('events')->makeVisible(self::STAFF);
    }

    public function update(Request $r, Application $application, ProgramMailer $mailer)
    {
        $d = $r->validate([
            'status' => ['required', Rule::in(array_keys(Application::STATUSES))],
            'message' => 'nullable|string|max:2000', 'internal_notes' => 'nullable|string|max:3000',
        ]);
        $changed = $d['status'] !== $application->status || filled($d['message'] ?? null);
        $before = $application->only(['status', 'internal_notes']);
        $application->update(['status' => $d['status'], 'internal_notes' => $d['internal_notes'] ?? null]);
        if ($d['status'] === 'approved') {
            Payout::firstOrCreate(['application_id' => $application->id], ['status' => 'pending']);
        }
        if ($changed) {
            $application->events()->create(['status' => $d['status'], 'message' => $d['message'] ?? null, 'author_role' => 'admin']);
            $mailer->send('status_update', $application, $d['message'] ?? null);
        }
        if ($before !== $application->only(['status', 'internal_notes'])) {
            AdminActivityLog::record('updated', 'application', $application->id, ['before' => $before, 'after' => $application->only(['status', 'internal_notes'])]);
        }

        return $application->fresh()->load('events')->makeVisible(self::STAFF);
    }

    public function destroy(Application $application)
    {
        AdminActivityLog::record('deleted', 'application', $application->id, ['reference' => $application->reference]);
        $application->delete();

        return response()->json(['message' => 'Application deleted.']);
    }
}
