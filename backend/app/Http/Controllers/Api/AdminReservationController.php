<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;

class AdminReservationController extends Controller
{
    public function confirmManualPayment(Reservation $reservation)
    {
        $payment = $reservation->payment()
            ->where('provider', 'manual')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Manual payment not found'], 404);
        }

        $payment->update(['status' => 'paid']);
        $reservation->update(['status' => 'confirmed']);

        return response()->json($payment);
    }
}
