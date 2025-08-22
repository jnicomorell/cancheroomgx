<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentWebhookController;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('fields', [FieldController::class, 'index']);

        Route::get('reservations', [ReservationController::class, 'index']);
        Route::post('reservations', [ReservationController::class, 'store']);
        Route::delete('reservations/{reservation}', [ReservationController::class, 'destroy']);
    });

    Route::post('payments/webhook', PaymentWebhookController::class);
});
