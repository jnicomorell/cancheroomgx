<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TournamentsTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(?User &$user = null): string
    {
        $user = User::factory()->create(['role' => 'admin']);
        return $user->createToken('test')->plainTextToken;
    }

    private function userToken(?User &$user = null): string
    {
        $user = User::factory()->create();
        return $user->createToken('test')->plainTextToken;
    }

    public function test_user_can_list_tournaments(): void
    {
        $token = $this->userToken();
        Tournament::create([
            'name' => 'Summer Cup',
            'start_date' => '2025-01-01',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/tournaments');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_tournament(): void
    {
        $token = $this->adminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/tournaments', [
                'name' => 'Create Cup',
                'start_date' => '2025-02-01',
                'end_date' => '2025-02-10',
                'location' => 'City Arena',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Create Cup']);
    }

    public function test_admin_can_update_tournament(): void
    {
        $token = $this->adminToken($admin);
        $tournament = Tournament::create([
            'name' => 'Old Cup',
            'start_date' => '2025-03-01',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/tournaments/' . $tournament->id, [
                'name' => 'New Cup',
                'start_date' => '2025-03-01',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Cup']);
    }

    public function test_admin_can_delete_tournament(): void
    {
        $token = $this->adminToken($admin);
        $tournament = Tournament::create([
            'name' => 'Delete Cup',
            'start_date' => '2025-04-01',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/tournaments/' . $tournament->id);

        $response->assertStatus(204);
    }

    public function test_user_can_register_team_to_tournament(): void
    {
        $token = $this->userToken();
        $tournament = Tournament::create([
            'name' => 'Register Cup',
            'start_date' => '2025-05-01',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/tournaments/' . $tournament->id . '/register', [
                'team_name' => 'Warriors',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('team.name', 'Warriors');
    }

    public function test_user_cannot_create_tournament(): void
    {
        $token = $this->userToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/tournaments', [
                'name' => 'Nope Cup',
                'start_date' => '2025-06-01',
            ]);

        $response->assertStatus(403);
    }
}

