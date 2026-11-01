<div style="font-family:Arial,sans-serif;max-width:520px;color:#16263f">
<h2>We received your application</h2>
<p>Hi {{ $application->first_name }}, thank you. Your reference number is:</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:1px">{{ $application->reference }}</p>
<p>Track progress any time at <a href="{{ config('program.frontend_url') }}/status">{{ config('program.frontend_url') }}/status</a> using this reference and your email address. Typical review time: {{ config('program.review_time') }}.</p>
<p style="font-size:13px;color:#667">We never ask for passwords, PINs, card numbers, one-time codes or upfront fees.</p></div>
