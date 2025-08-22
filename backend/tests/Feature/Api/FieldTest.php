<?php

namespace Tests\Feature\Api;

use App\Models\Club;
use App\Models\Field;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FieldTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_fields(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_field(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/fields', [
                'club_id' => $club->id,
                'name' => 'Cancha 2',
                'sport' => 'futbol',
                'price_per_hour' => 100,
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Cancha 2']);
    }

    public function test_admin_can_update_field(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
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

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/fields/' . $field->id, [
                'club_id' => $club->id,
                'name' => 'Cancha 1 updated',
                'sport' => 'futbol',
                'price_per_hour' => 150,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Cancha 1 updated']);
    }

    public function test_admin_can_delete_field(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
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

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/fields/' . $field->id);

        $response->assertStatus(204);
    }
}

