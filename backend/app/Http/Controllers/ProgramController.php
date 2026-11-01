<?php

namespace App\Http\Controllers;

use App\Models\ProgramSetting;

class ProgramController extends Controller
{
    public function __invoke()
    {
        return array_merge(config('program'), ProgramSetting::where('key', 'program')->first()?->value ?? []);
    }
}
