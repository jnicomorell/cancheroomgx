<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\NearbyFieldController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
    Route::post('auth/reset-password', [PasswordResetController::class, 'reset'])->name('password.reset');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
            $request->fulfill();

            return response()->json(['message' => 'Email verified']);
        })->middleware('signed')->name('verification.verify');

        Route::post('email/verification-notification', function (Request $request) {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json(['message' => 'Already verified'], 400);
            }

            $request->user()->sendEmailVerificationNotification();

            return response()->json(['message' => 'Verification link sent']);
        })->middleware('throttle:6,1')->name('verification.send');

        Route::get('fields/nearby', NearbyFieldController::class);

        Route::get('tournaments', [TournamentController::class, 'index']);
        Route::get('tournaments/{tournament}', [TournamentController::class, 'show']);
        Route::post('tournaments/{tournament}/register', [TournamentController::class, 'register']);

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::apiResource('clubs', ClubController::class)->except(['create', 'edit']);
            Route::apiResource('fields', FieldController::class)->except(['create', 'edit']);

            Route::post('tournaments', [TournamentController::class, 'store']);
            Route::put('tournaments/{tournament}', [TournamentController::class, 'update']);
            Route::delete('tournaments/{tournament}', [TournamentController::class, 'destroy']);
        });

        Route::get('reservations', [ReservationController::class, 'index']);
        Route::post('reservations', [ReservationController::class, 'store']);
        Route::put('reservations/{reservation}', [ReservationController::class, 'update']);
        Route::post('reservations/{reservation}/waitlist', [ReservationController::class, 'waitlist']);
        Route::delete('reservations/{reservation}', [ReservationController::class, 'destroy']);

        Route::post('payments/checkout', [PaymentController::class, 'checkout']);
    });

    Route::post('payments/webhook', PaymentWebhookController::class);
});
