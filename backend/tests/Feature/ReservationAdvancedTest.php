<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationAdvancedTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_reschedule_to_overlapping_slot(): void
    {
        $user = User::factory()->create();
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

        $other = User::factory()->create();
        $newStart = now()->addDays(2);
        $newEnd = now()->addDays(2)->addHour();
        Reservation::create([
            'user_id' => $other->id,
            'field_id' => $field->id,
            'start_time' => $newStart,
            'end_time' => $newEnd,
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $response = $this->putJson('/api/v1/reservations/' . $reservation->id, [
            'start_time' => $newStart->toDateTimeString(),
            'end_time' => $newEnd->toDateTimeString(),
        ]);

        $response->assertStatus(409);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);

        $this->assertDatabaseCount('reservations', 2);
    }

    public function test_waitlist_assigns_positions_in_order(): void
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

        $waitUser1 = User::factory()->create();
        $waitUser2 = User::factory()->create();

        Sanctum::actingAs($waitUser1);
        $this->postJson('/api/v1/reservations/' . $reservation->id . '/waitlist')
            ->assertStatus(201)
            ->assertJsonFragment(['position' => 1]);

        Sanctum::actingAs($waitUser2);
        $this->postJson('/api/v1/reservations/' . $reservation->id . '/waitlist')
            ->assertStatus(201)
            ->assertJsonFragment(['position' => 2]);

        $this->assertDatabaseHas('waitlists', [
            'reservation_id' => $reservation->id,
            'user_id' => $waitUser1->id,
            'position' => 1,
        ]);

        $this->assertDatabaseHas('waitlists', [
            'reservation_id' => $reservation->id,
            'user_id' => $waitUser2->id,
            'position' => 2,
        ]);
    }
}
