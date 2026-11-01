<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/** Use after auth:sanctum:  EnsureRole::class.':admin'  or  ':user'. Wrong role gets a JSON 403. */
class EnsureRole
{
    public function handle(Request $r, Closure $next, string $role)
    {
        abort_unless($r->user() && $r->user()->role === $role, 403, 'You do not have access to this area.');
        abort_unless($r->user()->is_active, 403, 'This account is suspended.');

        return $next($r);
    }
}
