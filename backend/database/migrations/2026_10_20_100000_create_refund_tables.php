<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $t) {
            $t->id();
            $t->string('reference', 20)->unique();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('first_name');
            $t->string('last_name');
            $t->string('email')->index();
            $t->string('existing_reference', 60)->nullable();
            $t->text('message');
            $t->string('status', 20)->default('received')->index();
            $t->text('internal_notes')->nullable();
            $t->string('ip', 45)->nullable();
            $t->timestamps();
        });
        Schema::create('application_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('application_id')->constrained()->cascadeOnDelete();
            $t->string('status', 20);
            $t->text('message')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_events');
        Schema::dropIfExists('applications');
    }
};
