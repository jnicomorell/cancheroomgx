<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;
use App\Models\Waitlist;
use App\Notifications\ReservationReminderNotification;
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

        $delay = $reservation->start_time->copy()->subHour();
        $request->user()->notify(
            (new ReservationReminderNotification($reservation))->delay($delay)
        );

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

    public function update(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
        ]);

        $newReservation = $reservation->replicate();
        $newReservation->fill($data);
        $newReservation->rescheduled_from_id = $reservation->id;
        $newReservation->status = 'confirmed';
        $newReservation->save();

        $reservation->update(['status' => 'cancelled']);

        return response()->json($newReservation);
    }

    public function waitlist(Request $request, Reservation $reservation)
    {
        $position = Waitlist::where('reservation_id', $reservation->id)->max('position') ?? 0;

        $waitlist = Waitlist::create([
            'reservation_id' => $reservation->id,
            'user_id' => $request->user()->id,
            'position' => $position + 1,
        ]);

        return response()->json($waitlist, 201);
    }
}
