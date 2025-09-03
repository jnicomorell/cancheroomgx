<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserReservationController extends Controller
{
    public function upcoming(Request $request)
    {
        return $request->user()->reservations()
            ->where('status', 'confirmed')
            ->where('start_time', '>', now())
            ->with('field.club')
            ->get();
    }

    public function pending(Request $request)
    {
        return $request->user()->reservations()
            ->where('status', 'pending')
            ->with('field.club')
            ->get();
    }

    public function history(Request $request)
    {
        return $request->user()->reservations()
            ->where('end_time', '<', now())
            ->where('status', '!=', 'cancelled')
            ->with('field.club')
            ->get();
    }

    public function cancelled(Request $request)
    {
        return $request->user()->reservations()
            ->where('status', 'cancelled')
            ->with('field.club')
            ->get();
    }
}
