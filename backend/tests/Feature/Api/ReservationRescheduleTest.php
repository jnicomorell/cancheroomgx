<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationRescheduleTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_user_can_join_waitlist(): void
    {
        $owner = User::factory()->create();

        $club = Club::create([
            'user_id' => $owner->id,
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
            'user_id' => $owner->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $waitUser = User::factory()->create();
        $token = $waitUser->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/reservations/' . $reservation->id . '/waitlist');

        $response->assertStatus(201)
            ->assertJsonFragment(['position' => 1]);

        $this->assertDatabaseHas('waitlists', [
            'reservation_id' => $reservation->id,
            'user_id' => $waitUser->id,
            'position' => 1,
        ]);
    }
}
