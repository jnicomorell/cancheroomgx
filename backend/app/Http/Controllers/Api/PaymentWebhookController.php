<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $secret = config('services.mercadopago.webhook_secret');
        $signature = $request->header('x-signature');
        $expected = hash_hmac('sha256', $request->getContent(), $secret ?? '');

        if (!$signature || !hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        Log::info('MercadoPago webhook validated', $request->all());

        $reservation = Reservation::findOrFail($request->input('reservation_id'));
        $status = $request->input('status', 'paid');

        $reservationStatusMap = [
            'paid' => 'confirmed',
            'failed' => 'cancelled',
            'pending' => 'pending',
        ];
        $reservation->update([
            'status' => $reservationStatusMap[$status] ?? 'pending',
        ]);

        Payment::updateOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'status' => $status,
                'amount' => $request->input('amount', 0),
                'provider' => 'mercadopago',
                'payload' => $request->all(),
            ]
        );

        return response()->json(['received' => true]);
    }
}
