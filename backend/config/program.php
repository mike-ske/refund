<?php

// Public program details come from .env — nothing is invented.
return [
    'name' => env('PROGRAM_NAME', 'Allocation Refund Program'),
    'tagline' => env('PROGRAM_TAGLINE', 'Your Allocation. Our Commitment.'),
    'operator' => env('PROGRAM_OPERATOR'),
    'email' => env('PROGRAM_EMAIL'),
    'phone' => env('PROGRAM_PHONE'),
    'hours' => env('PROGRAM_HOURS', 'Mon – Fri, 8 AM – 6 PM'),
    'chat_url' => env('PROGRAM_CHAT_URL'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'review_time' => env('PROGRAM_REVIEW_TIME', '7–10 business days'),
    'social' => [
        'facebook' => env('PROGRAM_FACEBOOK_URL'),
        'x' => env('PROGRAM_X_URL'),
        'linkedin' => env('PROGRAM_LINKEDIN_URL'),
        'youtube' => env('PROGRAM_YOUTUBE_URL'),
    ],
];
