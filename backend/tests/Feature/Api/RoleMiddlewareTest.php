<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_routes_are_forbidden_for_non_admin_users(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/clubs');

        $response->assertStatus(403);
    }

    public function test_admin_routes_are_accessible_for_admin_users(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/clubs');

        $response->assertStatus(200);
    }
}

