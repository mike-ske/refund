<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class StatusUpdated extends Mailable
{
    public function __construct(public Application $application, public ?string $note = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Update on application '.$this->application->reference);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.status');
    }
}
