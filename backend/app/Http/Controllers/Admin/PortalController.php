<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Application;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Payout;
use App\Models\ProgramSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PortalController extends Controller
{
    public function dashboard()
    {
        $waiting = ['received', 'under_review', 'needs_info'];
        Application::where('status', 'approved')->whereDoesntHave('payout')->each(function (Application $application): void {
            Payout::create(['application_id' => $application->id, 'status' => 'pending']);
        });

        return [
            'counts' => Application::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'today' => Application::whereDate('created_at', today())->count(),
            'week' => Application::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'oldest_waiting' => Application::whereIn('status', $waiting)->oldest()->limit(5)->get(),
            'recent_activity' => AdminActivityLog::with('admin:id,name,email')->latest()->limit(8)->get(),
            'payout_totals' => Payout::selectRaw('status, count(*) as count, coalesce(sum(amount), 0) as amount')->groupBy('status')->get(),
        ];
    }

    public function users(Request $request)
    {
        return User::query()->where('role', 'user')->withCount('applications')
            ->when($request->filled('q'), fn (Builder $query) => $query->where(fn (Builder $search) => $search->where('name', 'like', '%'.$request->string('q').'%')->orWhere('email', 'like', '%'.$request->string('q').'%')))
            ->when($request->status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($request->status === 'suspended', fn (Builder $query) => $query->where('is_active', false))
            ->when(in_array($request->input('sort'), ['name', 'email', 'created_at', 'applications_count'], true), fn (Builder $query) => $query->orderBy($request->input('sort'), $request->input('direction') === 'asc' ? 'asc' : 'desc'), fn (Builder $query) => $query->latest())
            ->paginate(max(1, min((int) $request->input('per_page', 20), 100)));
    }

    public function createUser(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:160', 'email' => 'required|email:rfc|max:180|unique:users,email', 'password' => 'required|string|min:8', 'is_active' => 'sometimes|boolean']);
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password']), 'role' => 'user', 'is_active' => $data['is_active'] ?? true]);
        AdminActivityLog::record('created', 'user', $user->id, ['name' => $user->name, 'email' => $user->email]);

        return response()->json($user->loadCount('applications'), 201);
    }

    public function updateUser(Request $request, User $user)
    {
        abort_unless($user->role === 'user', 404);
        $data = $request->validate(['name' => 'sometimes|required|string|max:160', 'email' => ['sometimes', 'required', 'email:rfc', 'max:180', Rule::unique('users', 'email')->ignore($user->id)], 'is_active' => 'sometimes|boolean', 'password' => 'sometimes|nullable|string|min:8']);
        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            $this->ensureNotLastActiveAdmin($user);
        }
        $changes = collect($data)->except('password')->all();
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $changes['password_reset'] = true;
        } else {
            unset($data['password']);
        }
        $user->update($data);
        AdminActivityLog::record('updated', 'user', $user->id, $changes);

        return $user->fresh()->loadCount('applications');
    }

    public function deleteUser(Request $request, User $user)
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');
        abort_unless($user->role === 'user' || $user->id === $request->user()->id, 404);
        $this->ensureNotLastAdmin($user);
        $applicationCount = $user->applications()->count();
        if ($applicationCount > 0 && ! $request->boolean('anonymize')) {
            return response()->json(['message' => 'This user has applications. Suspend the account or confirm anonymization to delete it.', 'code' => 'has_applications'], 409);
        }
        DB::transaction(function () use ($user, $applicationCount): void {
            if ($applicationCount > 0) {
                $user->applications()->update(['user_id' => null]);
            }
            AdminActivityLog::record('deleted', 'user', $user->id, ['email' => $user->email, 'applications_anonymized' => $applicationCount]);
            $user->delete();
        });

        return response()->json(['message' => 'User deleted.']);
    }

    public function payouts()
    {
        Application::where('status', 'approved')->whereDoesntHave('payout')->each(function (Application $application): void {
            Payout::create(['application_id' => $application->id, 'status' => 'pending']);
        });

        return Payout::with('application')->latest()->paginate(20);
    }

    public function updatePayout(Request $request, Payout $payout)
    {
        $data = $request->validate(['amount' => 'nullable|numeric|min:0|max:9999999999.99', 'status' => ['required', Rule::in(['pending', 'paid', 'failed'])], 'payment_reference' => 'nullable|string|max:120', 'paid_at' => 'nullable|date']);
        if ($data['status'] === 'paid' && empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        $before = $payout->only(['amount', 'status', 'payment_reference', 'paid_at']);
        $payout->update($data);
        AdminActivityLog::record('updated', 'payout', $payout->id, ['before' => $before, 'after' => $data]);

        return $payout->fresh()->load('application');
    }

    public function emailTemplates()
    {
        return ['templates' => EmailTemplate::orderBy('key')->get(), 'logs' => EmailLog::with('application:id,reference')->latest()->paginate(25)];
    }

    public function updateEmailTemplate(Request $request, EmailTemplate $emailTemplate)
    {
        $data = $request->validate(['subject' => 'required|string|max:200', 'body' => 'required|string|max:10000']);
        $emailTemplate->update($data);
        AdminActivityLog::record('updated', 'email_template', $emailTemplate->id, ['key' => $emailTemplate->key]);

        return $emailTemplate->fresh();
    }

    public function reports()
    {
        $applications = Application::all(['status', 'created_at', 'updated_at']);
        $weekly = $applications->groupBy(fn (Application $application) => $application->created_at->startOfWeek()->toDateString())->map(fn ($items, $week) => ['week' => $week, 'count' => $items->count()])->values();
        $total = Application::count();
        $approved = $applications->where('status', 'approved')->count();
        $rejected = $applications->where('status', 'rejected')->count();
        $reviewed = $applications->whereIn('status', ['approved', 'rejected']);
        $review = $reviewed->count() ? $reviewed->avg(fn (Application $application) => abs($application->created_at->diffInHours($application->updated_at, false))) : 0;

        return ['weekly' => $weekly, 'total' => $total, 'approved' => $approved, 'rejected' => $rejected, 'approval_rate' => $total ? round($approved / $total * 100, 1) : 0, 'rejection_rate' => $total ? round($rejected / $total * 100, 1) : 0, 'average_review_hours' => round((float) $review, 1)];
    }

    public function exportReports()
    {
        $rows = Application::query()->orderBy('created_at')->get(['reference', 'first_name', 'last_name', 'email', 'status', 'created_at']);

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['reference', 'first_name', 'last_name', 'email', 'status', 'submitted_at']);
            foreach ($rows as $row) {
                fputcsv($output, $row->toArray());
            }
            fclose($output);
        }, 'applications-report.csv', ['Content-Type' => 'text/csv']);
    }

    public function settings(Request $request)
    {
        return ['program' => ProgramSetting::where('key', 'program')->first()?->value ?? ['name' => config('program.name'), 'operator' => config('program.operator'), 'phone' => config('program.phone'), 'email' => config('program.email'), 'hours' => config('program.hours'), 'review_time' => config('program.review_time')], 'staff' => User::where('role', 'admin')->get(['id', 'name', 'email', 'is_active', 'created_at']), 'activity' => AdminActivityLog::with('admin:id,name,email')->latest()->paginate(30)];
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:160', 'operator' => 'nullable|string|max:160', 'phone' => 'nullable|string|max:40', 'email' => 'nullable|email|max:180', 'hours' => 'nullable|string|max:160', 'review_time' => 'nullable|string|max:100']);
        ProgramSetting::updateOrCreate(['key' => 'program'], ['value' => $data]);
        AdminActivityLog::record('updated', 'program_settings', null, $data);

        return ['program' => $data];
    }

    public function createStaff(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:160', 'email' => 'required|email|max:180|unique:users,email', 'password' => 'required|string|min:8']);
        $staff = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password']), 'role' => 'admin', 'is_active' => true]);
        AdminActivityLog::record('created', 'admin', $staff->id, ['email' => $staff->email]);

        return response()->json($staff->only(['id', 'name', 'email', 'is_active']), 201);
    }

    public function updateStaff(Request $request, User $user)
    {
        abort_unless($user->role === 'admin', 404);
        $data = $request->validate(['name' => 'sometimes|required|string|max:160', 'email' => ['sometimes', 'required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($user->id)], 'is_active' => 'sometimes|boolean', 'password' => 'sometimes|nullable|string|min:8']);
        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            $this->ensureNotLastActiveAdmin($user);
            abort_if($request->user()->is($user), 422, 'You cannot deactivate your own account.');
        }
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        AdminActivityLog::record('updated', 'admin', $user->id, collect($data)->except('password')->all());

        return $user->fresh()->only(['id', 'name', 'email', 'is_active']);
    }

    public function deleteStaff(Request $request, User $user)
    {
        abort_unless($user->role === 'admin', 404);
        $this->ensureNotLastAdmin($user);
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');
        AdminActivityLog::record('deleted', 'admin', $user->id, ['email' => $user->email]);
        $user->delete();

        return response()->json(['message' => 'Staff account deleted.']);
    }

    private function ensureNotLastAdmin(User $user): void
    {
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            abort(422, 'The last administrator cannot be deleted.');
        }
    }

    private function ensureNotLastActiveAdmin(User $user): void
    {
        if ($user->role === 'admin' && $user->is_active && User::where('role', 'admin')->where('is_active', true)->count() <= 1) {
            abort(422, 'The last active administrator cannot be suspended.');
        }
    }
}
