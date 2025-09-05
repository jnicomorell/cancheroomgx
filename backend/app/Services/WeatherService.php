<?php

namespace App\Services;

use GuzzleHttp\Client;

class WeatherService
{
    public function __construct(private Client $client)
    {
    }

    /**
     * Retrieve current weather data from the OpenWeatherMap API.
     */
    public function getWeather(float $lat, float $lng): array
    {
        $response = $this->client->get('https://api.openweathermap.org/data/2.5/weather', [
            'query' => [
                'lat'   => $lat,
                'lon'   => $lng,
                'appid' => config('services.openweather.key'),
                'units' => 'metric',
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}
