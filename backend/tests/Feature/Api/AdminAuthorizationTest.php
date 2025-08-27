<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_protected_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Club',
            'address' => 'Street',
        ]);

        $this->actingAs($admin, 'sanctum');

        $this->getJson('/api/v1/clubs')->assertOk();

        $fieldData = [
            'club_id' => $club->id,
            'name' => 'Field',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ];

        $this->postJson('/api/v1/fields', $fieldData)->assertCreated();

        $this->postJson('/api/v1/payments/confirm')->assertOk();
    }

    public function test_non_admin_is_denied_access_to_protected_routes(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club',
            'address' => 'Street',
        ]);

        $fieldData = [
            'club_id' => $club->id,
            'name' => 'Field',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ];

        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/v1/clubs')->assertForbidden();
        $this->postJson('/api/v1/fields', $fieldData)->assertForbidden();
        $this->postJson('/api/v1/payments/confirm')->assertForbidden();
    }
}
