<?php

namespace App\Services;

use GuzzleHttp\Client;

class WeatherService
{
    public function __construct(private Client $client)
    {
    }

    public function getWeather(float $lat, float $lng): array
    {
        $response = $this->client->get('https://api.open-meteo.com/v1/forecast', [
            'query' => [
                'latitude' => $lat,
                'longitude' => $lng,
                'current_weather' => true,
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}
