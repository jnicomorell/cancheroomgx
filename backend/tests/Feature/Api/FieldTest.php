<?php

namespace Tests\Feature\Api;

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
}
