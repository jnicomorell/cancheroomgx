<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use App\Models\ExtraService;
use App\Services\CalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExtrasTest extends TestCase
{
    use RefreshDatabase;

    public function test_attach_extra_service_and_convert_currency(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);

        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Cancha 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $extra = ExtraService::create([
            'name' => 'Ball rental',
            'price' => 10,
            'currency' => 'USD',
        ]);

        $this->postJson('/api/v1/reservations/' . $reservation->id . '/extra-services', [
            'extra_services' => [$extra->id],
        ])->assertStatus(200)->assertJson(['message' => __('extra_services.attached')]);

        $this->assertDatabaseHas('extra_service_reservation', [
            'reservation_id' => $reservation->id,
            'extra_service_id' => $extra->id,
        ]);

        $this->getJson('/api/v1/extra-services?currency=EUR')
            ->assertStatus(200)
            ->assertJsonFragment(['currency' => 'EUR']);
    }

    public function test_calendar_service_called_on_reservation_creation(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        $calendar = \Mockery::mock(CalendarService::class);
        $calendar->shouldReceive('createEvent')->once();
        $this->app->instance(CalendarService::class, $calendar);

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);

        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Cancha 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $payload = [
            'field_id' => $field->id,
            'start_time' => now()->addDay()->toDateTimeString(),
            'end_time' => now()->addDay()->addHour()->toDateTimeString(),
            'total_price' => 100,
        ];

        $this->postJson('/api/v1/reservations', $payload)
            ->assertStatus(201);
    }
}
