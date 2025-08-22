<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        Payment::create([
            'reservation_id' => $request->input('reservation_id'),
            'status' => $request->input('status', 'paid'),
            'amount' => $request->input('amount', 0),
            'provider' => 'mercadopago',
            'payload' => $request->all(),
        ]);

        return response()->json(['received' => true]);
    }
}
