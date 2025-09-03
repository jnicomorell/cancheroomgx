<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Models\Reservation;

class AdminReportController extends Controller
{
    public function occupancy()
    {
        $now = now();

        $occupied = Reservation::where('status', 'confirmed')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->count();

        $total = Field::count();
        $rate = $total > 0 ? round(($occupied / $total) * 100, 2) : 0;

        return response()->json([
            'occupied' => $occupied,
            'total' => $total,
            'occupancy_rate' => $rate,
        ]);
    }

    public function reservations()
    {
        $total = Reservation::count();
        $confirmed = Reservation::where('status', 'confirmed')->count();
        $cancelled = Reservation::where('status', 'cancelled')->count();
        $pending = Reservation::where('status', 'pending')->count();

        return response()->json([
            'total' => $total,
            'confirmed' => $confirmed,
            'cancelled' => $cancelled,
            'pending' => $pending,
        ]);
    }
}
