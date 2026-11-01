<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $guarded = [];

    protected $casts = ['sent_at' => 'datetime'];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
