<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Application extends Model
{
    protected $guarded = [];

    protected $hidden = ['internal_notes', 'ip', 'user_id'];     // staff-only fields; admin endpoints call makeVisible()

    protected $appends = ['status_label', 'full_name'];

    const STATUSES = [
        'received' => 'Received', 'under_review' => 'Under review', 'needs_info' => 'More information needed',
        'approved' => 'Approved', 'rejected' => 'Not approved',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(ApplicationEvent::class)->latest('id');
    }

    public function payout()
    {
        return $this->hasOne(Payout::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public static function newReference(): string
    {
        do {
            $ref = 'ARP-'.strtoupper(Str::random(8));
        } while (static::where('reference', $ref)->exists());

        return $ref;
    }
}
