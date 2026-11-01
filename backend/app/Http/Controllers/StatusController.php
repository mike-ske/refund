<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StatusController extends Controller
{
    public function __invoke(Request $r)
    {
        $d = $r->validate(['reference' => 'required|string|max:20', 'email' => 'required|email']);
        $app = Application::with('events')->where('reference', strtoupper(trim($d['reference'])))->where('email', $d['email'])->first();
        // Same message whether the reference or the email was wrong, so references can't be guessed.
        if (! $app) {
            throw ValidationException::withMessages(['reference' => ['We could not find an application with that reference and email.']]);
        }

        return $app;
    }
}
