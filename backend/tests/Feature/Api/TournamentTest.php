<?php

namespace Tests\Feature\Api;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TournamentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_tournaments(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/tournaments');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_tournament(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/tournaments', [
                'name' => 'Winter Cup',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addWeek()->toDateString(),
                'location' => 'City Park',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Winter Cup']);
    }

    public function test_admin_can_update_tournament(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $tournament = Tournament::create([
            'name' => 'Spring Cup',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addWeek()->toDateString(),
            'location' => 'Old Field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/tournaments/' . $tournament->id, [
                'name' => 'Spring Cup Updated',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addWeek()->toDateString(),
                'location' => 'New Field',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Spring Cup Updated']);
    }

    public function test_admin_can_delete_tournament(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $tournament = Tournament::create([
            'name' => 'Autumn Cup',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addWeek()->toDateString(),
            'location' => 'Some Field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/tournaments/' . $tournament->id);

        $response->assertStatus(204);
    }

    public function test_can_register_team_in_tournament(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $tournament = Tournament::create([
            'name' => 'Registration Cup',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addWeek()->toDateString(),
            'location' => 'Main Field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/tournaments/' . $tournament->id . '/register', [
                'team_name' => 'Champions',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['team_id' => 1]);
    }
}
