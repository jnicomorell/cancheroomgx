<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FieldsTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(User &$user = null): string
    {
        $user = User::factory()->create(['role' => 'admin']);
        return $user->createToken('test')->plainTextToken;
    }

    private function createClub(User $owner): Club
    {
        return Club::create([
            'user_id' => $owner->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);
    }

    public function test_admin_can_list_fields(): void
    {
        $token = $this->adminToken($admin);
        $club = $this->createClub($admin);
        Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_show_field(): void
    {
        $token = $this->adminToken($admin);
        $club = $this->createClub($admin);
        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field Show',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields/' . $field->id);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Field Show']);
    }

    public function test_admin_can_create_field(): void
    {
        $token = $this->adminToken($admin);
        $club = $this->createClub($admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/fields', [
                'club_id' => $club->id,
                'name' => 'Field 2',
                'sport' => 'futbol',
                'price_per_hour' => 100,
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Field 2']);
    }

    public function test_admin_can_update_field(): void
    {
        $token = $this->adminToken($admin);
        $club = $this->createClub($admin);
        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/fields/' . $field->id, [
                'club_id' => $club->id,
                'name' => 'Field 1 Updated',
                'sport' => 'futbol',
                'price_per_hour' => 150,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Field 1 Updated']);
    }

    public function test_admin_can_delete_field(): void
    {
        $token = $this->adminToken($admin);
        $club = $this->createClub($admin);
        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/fields/' . $field->id);

        $response->assertStatus(204);
    }

    public function test_user_cannot_access_fields(): void
    {
        $owner = User::factory()->create();
        $club = $this->createClub($owner);
        Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields');

        $response->assertStatus(403);
    }
}
