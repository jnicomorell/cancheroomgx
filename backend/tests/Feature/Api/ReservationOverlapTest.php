<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationOverlapTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_create_overlapping_reservation(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

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

        $start = now()->addDay();
        $end = now()->addDay()->addHour();

        Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => $start,
            'end_time' => $end,
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/reservations', [
                'field_id' => $field->id,
                'start_time' => $start->copy()->addMinutes(30)->toDateTimeString(),
                'end_time' => $end->copy()->addMinutes(30)->toDateTimeString(),
                'total_price' => 100,
            ]);

        $response->assertStatus(409);
        $this->assertDatabaseCount('reservations', 1);
    }
}

