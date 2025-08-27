<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\User;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NearbyFieldTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_nearby_fields_with_weather_and_cache(): void
    {
        config(['cache.default' => 'redis', 'cache.stores.redis.driver' => 'array']);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $clubNear = Club::create([
            'user_id' => $user->id,
            'name' => 'Near Club',
            'address' => 'Street 1',
            'lat' => -34.6,
            'lng' => -58.4,
        ]);

        Field::create([
            'club_id' => $clubNear->id,
            'name' => 'Near Field',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $clubFar = Club::create([
            'user_id' => $user->id,
            'name' => 'Far Club',
            'address' => 'Street 2',
            'lat' => 10,
            'lng' => 10,
        ]);

        Field::create([
            'club_id' => $clubFar->id,
            'name' => 'Far Field',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $this->mock(WeatherService::class, function ($mock) {
            $mock->shouldReceive('getWeather')->once()->andReturn(['temp' => 20]);
        });

        $params = ['lat' => -34.6, 'lng' => -58.4];
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields/nearby?' . http_build_query($params));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Near Field'])
            ->assertJsonFragment(['temp' => 20]);

        // second request should hit cache, weather service not called again
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields/nearby?' . http_build_query($params));
    }
}
