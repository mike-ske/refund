<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    protected $guarded = [];

    protected $casts = ['paid_at' => 'datetime', 'amount' => 'decimal:2'];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
