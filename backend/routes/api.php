<?php

use App\Http\Controllers\Admin\ApplicationController as AdminApplications;
use App\Http\Controllers\Admin\ContactController as AdminContacts;
use App\Http\Controllers\Admin\PortalController as AdminPortal;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserAuthController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/program', ProgramController::class);
Route::post('/status', StatusController::class)->middleware('throttle:10,1');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
Route::post('/applications', [ApplicationController::class, 'store'])->middleware('throttle:5,1');
Route::post('/register', [UserAuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [UserAuthController::class, 'login'])->middleware('throttle:8,1');

// Staff (role: admin) — separate sign-in
Route::post('/admin/login', [UserAuthController::class, 'adminLogin'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UserAuthController::class, 'me']);
    Route::post('/logout', [UserAuthController::class, 'logout']);

    Route::prefix('admin')->middleware(EnsureRole::class.':admin')->group(function () {
        Route::get('/dashboard', [AdminPortal::class, 'dashboard']);
        Route::get('/stats', [AdminApplications::class, 'stats']);
        Route::get('/applications', [AdminApplications::class, 'index']);
        Route::get('/applications/{application}', [AdminApplications::class, 'show']);
        Route::put('/applications/{application}', [AdminApplications::class, 'update']);
        Route::delete('/applications/{application}', [AdminApplications::class, 'destroy']);
        Route::get('/users', [AdminPortal::class, 'users']);
        Route::post('/users', [AdminPortal::class, 'createUser']);
        Route::put('/users/{user}', [AdminPortal::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminPortal::class, 'deleteUser']);
        Route::get('/payouts', [AdminPortal::class, 'payouts']);
        Route::put('/payouts/{payout}', [AdminPortal::class, 'updatePayout']);
        Route::get('/emails', [AdminPortal::class, 'emailTemplates']);
        Route::put('/emails/{emailTemplate}', [AdminPortal::class, 'updateEmailTemplate']);
        Route::get('/reports', [AdminPortal::class, 'reports']);
        Route::get('/reports/export', [AdminPortal::class, 'exportReports']);
        Route::get('/settings', [AdminPortal::class, 'settings']);
        Route::put('/settings', [AdminPortal::class, 'updateSettings']);
        Route::post('/staff', [AdminPortal::class, 'createStaff']);
        Route::put('/staff/{user}', [AdminPortal::class, 'updateStaff']);
        Route::delete('/staff/{user}', [AdminPortal::class, 'deleteStaff']);
        Route::get('/contacts', [AdminContacts::class, 'index']);
        Route::put('/contacts/{contactMessage}', [AdminContacts::class, 'update']);
    });
});
