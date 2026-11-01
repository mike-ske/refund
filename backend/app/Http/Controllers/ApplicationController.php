<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\User;
use App\Services\ProgramMailer;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function store(Request $r, ProgramMailer $mailer)
    {
        $d = $r->validate([
            'first_name' => 'required|string|max:80', 'last_name' => 'required|string|max:80',
            'email' => 'required|email:rfc|max:150', 'phone' => 'required|string|max:40|regex:/^\+[1-9][0-9]{0,3}[0-9 ()-]{5,25}$/',
            'existing_reference' => 'nullable|string|max:60',
            'message' => 'required|string|min:10|max:2000', 'consent' => 'accepted',
        ], ['consent.accepted' => 'Please confirm the declaration to continue.']);
        $applicantId = User::whereRaw('LOWER(email) = ?', [strtolower($d['email'])])->where('role', 'user')->value('id');
        $app = Application::create(['reference' => Application::newReference(), 'user_id' => $applicantId, 'ip' => $r->ip(), 'status' => 'received'] + collect($d)->except('consent')->all());
        $app->events()->create(['status' => 'received', 'message' => 'Your application was received.']);
        $mailer->send('received', $app);

        return response()->json($app->load('events'), 201);
    }
}
