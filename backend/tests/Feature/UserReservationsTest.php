<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\ReservationReminderNotification;
use App\Notifications\WeatherAlertNotification;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class UserReservationsTest extends TestCase
{
    use RefreshDatabase;

    private function setupUserAndField(): array
    {
        $user = User::factory()->create();

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
            'lat' => 0,
            'lng' => 0,
        ]);

        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        return [$user, $field];
    }

    public function test_user_reservation_filters(): void
    {
        [$user, $field] = $this->setupUserAndField();
        Sanctum::actingAs($user);

        Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDays(2),
            'end_time' => now()->addDays(2)->addHour(),
            'status' => 'pending',
            'total_price' => 100,
        ]);

        Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->subDays(2),
            'end_time' => now()->subDay(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDays(3),
            'end_time' => now()->addDays(3)->addHour(),
            'status' => 'cancelled',
            'total_price' => 100,
        ]);

        $this->getJson('/api/v1/user/reservations/upcoming')
            ->assertStatus(200)
            ->assertJsonCount(1);

        $this->getJson('/api/v1/user/reservations/pending')
            ->assertStatus(200)
            ->assertJsonCount(1);

        $this->getJson('/api/v1/user/reservations/history')
            ->assertStatus(200)
            ->assertJsonCount(1);

        $this->getJson('/api/v1/user/reservations/cancelled')
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_store_sends_notifications(): void
    {
        [$user, $field] = $this->setupUserAndField();
        Sanctum::actingAs($user);

        Notification::fake();

        $weather = Mockery::mock(WeatherService::class);
        $weather->shouldReceive('getWeather')->andReturn([
            'current_weather' => ['temperature' => 20, 'weathercode' => 0],
        ]);
        $this->app->instance(WeatherService::class, $weather);

        $response = $this->postJson('/api/v1/reservations', [
            'field_id' => $field->id,
            'start_time' => now()->addDay()->toDateTimeString(),
            'end_time' => now()->addDay()->addHour()->toDateTimeString(),
            'total_price' => 100,
        ]);

        $response->assertStatus(201);

        Notification::assertSentTo($user, ReservationReminderNotification::class);
        Notification::assertSentTo($user, WeatherAlertNotification::class);
    }
}
