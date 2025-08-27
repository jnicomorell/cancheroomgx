<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_reservation(): void
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

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/reservations', [
                'field_id' => $field->id,
                'start_time' => $start->toDateTimeString(),
                'end_time' => $end->toDateTimeString(),
                'total_price' => 100,
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['field_id' => $field->id]);

        $this->assertDatabaseHas('reservations', [
            'field_id' => $field->id,
            'user_id' => $user->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_user_can_cancel_reservation(): void
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

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/reservations/' . $reservation->id);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Reservation cancelled']);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_user_can_reschedule_reservation(): void
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

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $newStart = now()->addDays(2);
        $newEnd = now()->addDays(2)->addHour();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/reservations/' . $reservation->id, [
                'start_time' => $newStart->toDateTimeString(),
                'end_time' => $newEnd->toDateTimeString(),
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['rescheduled_from_id' => $reservation->id]);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('reservations', [
            'rescheduled_from_id' => $reservation->id,
            'start_time' => $newStart->toDateTimeString(),
            'end_time' => $newEnd->toDateTimeString(),
        ]);
    }
}
