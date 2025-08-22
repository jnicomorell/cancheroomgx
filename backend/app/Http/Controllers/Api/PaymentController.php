<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Http\Request;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'reservation_id' => ['required', 'exists:reservations,id'],
        ]);

        $reservation = Reservation::findOrFail($data['reservation_id']);

        MercadoPagoConfig::setAccessToken(config('services.mercadopago.token'));
        $client = new PreferenceClient();

        $preference = $client->create([
            'items' => [
                [
                    'title' => 'Reservation ' . $reservation->id,
                    'quantity' => 1,
                    'unit_price' => (float) $reservation->total_price,
                ],
            ],
            'metadata' => [
                'reservation_id' => $reservation->id,
            ],
        ]);

        Payment::create([
            'reservation_id' => $reservation->id,
            'provider' => 'mercadopago',
            'status' => 'pending',
            'amount' => $reservation->total_price,
            'payload' => [],
        ]);

        return response()->json([
            'preference_id' => $preference->id ?? null,
            'init_point' => $preference->init_point ?? null,
        ], 201);
    }
}
