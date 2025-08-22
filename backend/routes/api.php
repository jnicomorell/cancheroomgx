<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\ClubController;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('fields', [FieldController::class, 'index']);

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::get('clubs', [ClubController::class, 'index']);
            Route::post('clubs', [ClubController::class, 'store']);
            Route::put('clubs/{club}', [ClubController::class, 'update']);
            Route::delete('clubs/{club}', [ClubController::class, 'destroy']);

            Route::post('fields', [FieldController::class, 'store']);
            Route::put('fields/{field}', [FieldController::class, 'update']);
            Route::delete('fields/{field}', [FieldController::class, 'destroy']);
        });

        Route::get('reservations', [ReservationController::class, 'index']);
        Route::post('reservations', [ReservationController::class, 'store']);
        Route::put('reservations/{reservation}', [ReservationController::class, 'update']);
        Route::post('reservations/{reservation}/waitlist', [ReservationController::class, 'waitlist']);
        Route::delete('reservations/{reservation}', [ReservationController::class, 'destroy']);
    });

    Route::post('payments/webhook', PaymentWebhookController::class);
});
