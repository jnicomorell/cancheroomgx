<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @dataProvider statusProvider
     */
    public function test_webhook_updates_reservation_status(string $status): void
    {
        config()->set('services.mercadopago.webhook_secret', 'secret');

        $user = User::factory()->create();
        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club',
            'address' => 'Street',
        ]);
        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field',
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

        $payload = [
            'reservation_id' => $reservation->id,
            'status' => $status,
            'amount' => 100,
        ];
        $signature = hash_hmac('sha256', json_encode($payload), 'secret');

        $this->withHeader('X-Signature', $signature)
            ->postJson('/api/v1/payments/webhook', $payload)
            ->assertOk();

        $reservation->refresh();
        $this->assertSame($status, $reservation->status);
        $this->assertDatabaseHas('payments', [
            'reservation_id' => $reservation->id,
            'status' => $status,
        ]);
    }

    public static function statusProvider(): array
    {
        return [
            ['pending'],
            ['paid'],
            ['failed'],
        ];
    }

    public function test_invalid_signature_returns_bad_request(): void
    {
        config()->set('services.mercadopago.webhook_secret', 'secret');

        $user = User::factory()->create();
        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club',
            'address' => 'Street',
        ]);
        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field',
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

        $payload = [
            'reservation_id' => $reservation->id,
            'status' => 'paid',
            'amount' => 100,
        ];

        $this->withHeader('X-Signature', 'invalid')
            ->postJson('/api/v1/payments/webhook', $payload)
            ->assertStatus(400);
    }
}
