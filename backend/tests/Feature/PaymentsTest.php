<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_checkout_creates_preference_and_payment(): void
    {
        config(['services.mercadopago.token' => 'test']);
        $mp = Mockery::mock('overload:MercadoPago\\Client\\Preference\\PreferenceClient');
        $mp->shouldReceive('create')->once()->andReturn((object) [
            'id' => 'pref123',
            'init_point' => 'http://example.com',
        ]);

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
            'status' => 'pending',
            'total_price' => 100,
        ]);

        $response = $this->postJson('/api/v1/payments/checkout', [
            'reservation_id' => $reservation->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['preference_id' => 'pref123']);

        $this->assertDatabaseHas('payments', [
            'reservation_id' => $reservation->id,
            'provider' => 'mercadopago',
            'status' => 'pending',
            'amount' => 100,
        ]);
    }

    public function test_admin_can_register_and_confirm_manual_payment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $club = Club::create([
            'user_id' => $admin->id,
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
            'user_id' => $admin->id,
            'field_id' => $field->id,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHour(),
            'status' => 'pending',
            'total_price' => 100,
        ]);

        $response = $this->postJson('/api/v1/payments/manual', [
            'reservation_id' => $reservation->id,
            'amount' => 100,
        ]);

        $response->assertStatus(201);
        $paymentId = $response->json('id');

        $this->assertDatabaseHas('payments', [
            'id' => $paymentId,
            'provider' => 'manual',
            'status' => 'pending',
            'amount' => 100,
        ]);

        $this->postJson('/api/v1/payments/' . $paymentId . '/confirm')
            ->assertStatus(200);

        $this->assertDatabaseHas('payments', [
            'id' => $paymentId,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_webhook_validates_signature_and_updates_payment(): void
    {
        config(['services.mercadopago.webhook_secret' => 'secret']);

        $user = User::factory()->create();
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
            'status' => 'pending',
            'total_price' => 100,
        ]);

        $payload = [
            'reservation_id' => $reservation->id,
            'status' => 'paid',
            'amount' => 100,
        ];
        $signature = hash_hmac('sha256', json_encode($payload), 'secret');

        $this->postJson('/api/v1/payments/webhook', $payload, ['x-signature' => $signature])
            ->assertOk()
            ->assertJson(['received' => true]);

        $this->assertDatabaseHas('payments', [
            'reservation_id' => $reservation->id,
            'status' => 'paid',
            'amount' => 100,
        ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);
    }
}

