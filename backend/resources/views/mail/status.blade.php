<div style="font-family:Arial,sans-serif;max-width:520px;color:#16263f">
<h2>Update on {{ $application->reference }}</h2>
<p>Hi {{ $application->first_name }}, your application status is now: <b>{{ $application->status_label }}</b>.</p>
@if($note)<p style="white-space:pre-wrap">{{ $note }}</p>@endif
<p><a href="{{ config('program.frontend_url') }}/status">View full status</a></p>
<p style="font-size:13px;color:#667">We never ask for passwords, PINs, card numbers, one-time codes or upfront fees.</p></div>
