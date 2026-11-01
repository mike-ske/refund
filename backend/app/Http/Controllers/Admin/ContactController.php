<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\ContactMessage;
use App\Models\EmailLog;
use App\Models\ProgramSetting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index(): LengthAwarePaginator
    {
        return ContactMessage::query()->latest()->paginate(25);
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $data = $request->validate([
            'admin_reply' => ['required', 'string', 'min:2', 'max:3000'],
        ]);

        $contactMessage->update(['admin_reply' => $data['admin_reply'], 'status' => 'replied']);
        AdminActivityLog::record('replied', 'contact_message', $contactMessage->id, ['recipient' => $contactMessage->email]);

        $program = ProgramSetting::where('key', 'program')->first()?->value ?? [];
        $programName = $program['name'] ?? config('program.name');
        $deliveryStatus = 'sent';
        $deliveryError = null;
        try {
            Mail::raw("Hello {$contactMessage->name},\n\n{$data['admin_reply']}\n\nRegards,\n".$programName, function ($mail) use ($contactMessage, $programName): void {
                $mail->to($contactMessage->email)->subject('Reply from '.$programName);
            });
        } catch (\Throwable $exception) {
            $deliveryStatus = 'failed';
            $deliveryError = $exception->getMessage();
            Log::warning('Customer service reply email failed.', ['contact_message_id' => $contactMessage->id]);
        }
        EmailLog::create(['template_key' => 'contact_reply', 'recipient' => $contactMessage->email, 'subject' => 'Reply from '.$programName, 'status' => $deliveryStatus, 'error' => $deliveryError, 'sent_at' => $deliveryStatus === 'sent' ? now() : null]);

        return response()->json($contactMessage->fresh());
    }
}
