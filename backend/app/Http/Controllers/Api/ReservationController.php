<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->reservations()->with('field.club')->get();
    }

    public function store(ReservationRequest $request)
    {
        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'field_id' => $request->field_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'confirmed',
            'total_price' => $request->total_price,
        ]);

        return response()->json($reservation, 201);
    }

    public function destroy(Reservation $reservation)
    {
        if ($reservation->user_id !== request()->user()->id) {
            abort(403);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Reservation cancelled']);
    }
}
