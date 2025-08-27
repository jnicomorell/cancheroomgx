<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Services\WeatherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NearbyFieldController extends Controller
{
    public function __invoke(Request $request, WeatherService $weather)
    {
        $lat = (float) $request->query('lat');
        $lng = (float) $request->query('lng');

        $cacheKey = sprintf('nearby_fields_%s_%s', $lat, $lng);

        $fields = Cache::store('redis')->remember($cacheKey, 60, function () use ($lat, $lng, $weather) {
            return Field::with('club')->get()
                ->filter(function ($field) use ($lat, $lng) {
                    if (!$field->club) {
                        return false;
                    }
                    $distance = $this->distance($lat, $lng, $field->club->lat, $field->club->lng);
                    return $distance <= 50; // kilometers
                })
                ->map(function ($field) use ($weather) {
                    return [
                        'id' => $field->id,
                        'name' => $field->name,
                        'sport' => $field->sport,
                        'price_per_hour' => $field->price_per_hour,
                        'club' => [
                            'id' => $field->club->id,
                            'name' => $field->club->name,
                            'address' => $field->club->address,
                            'lat' => $field->club->lat,
                            'lng' => $field->club->lng,
                        ],
                        'weather' => $weather->getWeather($field->club->lat, $field->club->lng),
                    ];
                })
                ->values()
                ->toArray();
        });

        return response()->json(['data' => $fields]);
    }

    private function distance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
