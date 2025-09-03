<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(?User &$user = null): string
    {
        $user = User::factory()->create(['role' => 'admin']);
        return $user->createToken('test')->plainTextToken;
    }

    private function createField(User $admin): Field
    {
        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);

        return Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);
    }

    public function test_admin_can_view_occupancy_metrics(): void
    {
        $token = $this->adminToken($admin);
        $field = $this->createField($admin);

        Carbon::setTestNow('2023-01-01 10:00:00');
        Reservation::create([
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now(),
            'end_time' => now()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/reports/occupancy');

        $response->assertStatus(200)
            ->assertJson([
                'occupied' => 1,
                'total' => 1,
                'occupancy_rate' => 100,
            ]);
        Carbon::setTestNow();
    }

    public function test_admin_can_view_reservation_metrics(): void
    {
        $token = $this->adminToken($admin);
        $field = $this->createField($admin);

        Reservation::create([
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'confirmed',
            'total_price' => 100,
        ]);

        Reservation::create([
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now()->addDays(2),
            'end_time' => now()->addDays(2)->addHour(),
            'status' => 'cancelled',
            'total_price' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/reports/reservations');

        $response->assertStatus(200)
            ->assertJson([
                'total' => 2,
                'confirmed' => 1,
                'cancelled' => 1,
            ]);
    }

    public function test_admin_can_confirm_manual_payment(): void
    {
        $token = $this->adminToken($admin);
        $field = $this->createField($admin);

        $reservation = Reservation::create([
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'pending',
            'total_price' => 100,
        ]);

        Payment::create([
            'reservation_id' => $reservation->id,
            'provider' => 'manual',
            'status' => 'pending',
            'amount' => 100,
            'payload' => [],
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/reservations/' . $reservation->id . '/confirm-manual-payment');

        $response->assertStatus(200)
            ->assertJson(['status' => 'paid']);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_user_cannot_access_admin_endpoints(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/reports/occupancy')
            ->assertStatus(403);

        $adminToken = $this->adminToken($admin);
        $field = $this->createField($admin);
        $reservation = Reservation::create([
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'pending',
            'total_price' => 100,
        ]);
        Payment::create([
            'reservation_id' => $reservation->id,
            'provider' => 'manual',
            'status' => 'pending',
            'amount' => 100,
            'payload' => [],
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/reservations/' . $reservation->id . '/confirm-manual-payment')
            ->assertStatus(403);
    }
}
