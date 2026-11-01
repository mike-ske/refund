<?php

namespace App\Services;

use App\Models\Application;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ProgramMailer
{
    public function send(string $key, Application $application, ?string $message = null): bool
    {
        $template = EmailTemplate::where('key', $key)->first();
        $subject = $template?->subject ?? ($key === 'received' ? 'We received your application {{reference}}' : 'Update on application {{reference}}');
        $body = $template?->body ?? ($key === 'received' ? 'Hello {{name}}, we received your application. Your reference is {{reference}}.' : 'Hello {{name}}, the status of your application {{reference}} is {{status}}. {{message}}');
        $replacements = ['{{name}}' => $application->full_name, '{{reference}}' => $application->reference, '{{status}}' => $application->status_label, '{{message}}' => $message ?? ''];
        $subject = strtr($subject, $replacements);
        $body = strtr($body, $replacements);
        $status = 'sent';
        $error = null;
        try {
            Mail::raw($body, function ($mail) use ($application, $subject): void {
                $mail->to($application->email)->subject($subject);
            });
        } catch (Throwable $exception) {
            $status = 'failed';
            $error = $exception->getMessage();
            Log::warning('Program email failed.', ['application_id' => $application->id, 'template' => $key]);
        }
        EmailLog::create(['application_id' => $application->id, 'template_key' => $key, 'recipient' => $application->email, 'subject' => $subject, 'status' => $status, 'error' => $error, 'sent_at' => $status === 'sent' ? now() : null]);

        return $status === 'sent';
    }
}
