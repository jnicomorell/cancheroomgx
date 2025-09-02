<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClubsTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(User &$user = null): string
    {
        $user = User::factory()->create(['role' => 'admin']);
        return $user->createToken('test')->plainTextToken;
    }

    public function test_admin_can_list_clubs(): void
    {
        $token = $this->adminToken($admin);
        Club::create([
            'user_id' => $admin->id,
            'name' => 'List Club',
            'address' => 'Street',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/clubs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_show_club(): void
    {
        $token = $this->adminToken($admin);
        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Show Club',
            'address' => 'Street 2',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/clubs/' . $club->id);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Show Club']);
    }

    public function test_admin_can_create_club(): void
    {
        $token = $this->adminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/clubs', [
                'name' => 'Club Test',
                'address' => 'Street 123',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Club Test']);
    }

    public function test_admin_can_update_club(): void
    {
        $token = $this->adminToken($admin);
        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Old Name',
            'address' => 'Street',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/clubs/' . $club->id, [
                'name' => 'New Name',
                'address' => 'Street',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name']);
    }

    public function test_admin_can_delete_club(): void
    {
        $token = $this->adminToken($admin);
        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Delete Club',
            'address' => 'Street',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/clubs/' . $club->id);

        $response->assertStatus(204);
    }

    public function test_user_cannot_access_clubs(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/clubs');

        $response->assertStatus(403);
    }
}
