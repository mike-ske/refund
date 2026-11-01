<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ApplicationMessageController extends Controller
{
    public function store(Request $request, Application $application): JsonResponse
    {
        abort_unless($application->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:2000'],
        ]);

        $event = $application->events()->create([
            'status' => $application->status,
            'message' => $data['message'],
            'author_role' => 'user',
        ]);

        if (config('program.email')) {
            try {
                Mail::raw("Applicant {$application->full_name} ({$application->reference}) sent a message:\n\n{$data['message']}", function ($mail) use ($application): void {
                    $mail->to(config('program.email'))
                        ->subject("Applicant message: {$application->reference}");
                });
            } catch (\Throwable $exception) {
                Log::warning('Applicant message notification email failed.', ['application_id' => $application->id]);
            }
        }

        return response()->json($event, 201);
    }
}
