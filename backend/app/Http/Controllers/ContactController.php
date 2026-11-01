<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\EmailLog;
use App\Models\ProgramSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email:rfc', 'max:180'],
            'topic' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        $contactMessage = ContactMessage::create($data);

        $program = ProgramSetting::where('key', 'program')->first()?->value ?? [];
        $adminEmail = $program['email'] ?? config('program.email');
        if ($adminEmail) {
            $status = 'sent';
            $error = null;
            try {
                Mail::raw("{$contactMessage->name} ({$contactMessage->email}) wrote about {$contactMessage->topic}:\n\n{$contactMessage->message}", function ($mail) use ($adminEmail): void {
                    $mail->to($adminEmail)->subject('New customer service message');
                });
            } catch (\Throwable $exception) {
                $status = 'failed';
                $error = $exception->getMessage();
                Log::warning('Customer service notification email failed.');
            }
            EmailLog::create(['template_key' => 'contact_notification', 'recipient' => $adminEmail, 'subject' => 'New customer service message', 'status' => $status, 'error' => $error, 'sent_at' => $status === 'sent' ? now() : null]);
        }

        return response()->json(['message' => 'Your message has been received.'], 201);
    }
}
