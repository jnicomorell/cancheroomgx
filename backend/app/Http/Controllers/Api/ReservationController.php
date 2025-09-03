<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;
use App\Models\Waitlist;
use App\Notifications\ReservationReminderNotification;
use App\Notifications\WeatherAlertNotification;
use App\Services\WeatherService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->reservations()->with('field.club')->get();
    }

    public function store(ReservationRequest $request, WeatherService $weather)
    {
        $overlap = Reservation::where('field_id', $request->field_id)
            ->where('status', 'confirmed')
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'Time slot already booked'], 409);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'field_id' => $request->field_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'confirmed',
            'total_price' => $request->total_price,
            'recurring_rule' => $request->recurring_rule,
        ]);

        $reservation->load('field.club');

        $delay = $reservation->start_time->copy()->subHour();
        $request->user()->notify(
            (new ReservationReminderNotification($reservation))->delay($delay)
        );

        $club = $reservation->field->club;
        if ($club && $club->lat !== null && $club->lng !== null) {
            $weatherData = $weather->getWeather($club->lat, $club->lng);
            $request->user()->notify(
                (new WeatherAlertNotification($reservation, $weatherData))->delay($delay)
            );
        }

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
            'recurring_rule' => ['nullable', 'string'],
        ]);

        $overlap = Reservation::where('field_id', $reservation->field_id)
            ->where('status', 'confirmed')
            ->where('id', '!=', $reservation->id)
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'Time slot already booked'], 409);
        }

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
