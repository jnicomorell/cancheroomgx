<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClubTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_club(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/clubs', [
                'name' => 'Club Test',
                'address' => 'Street 123',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Club Test']);
    }
}

