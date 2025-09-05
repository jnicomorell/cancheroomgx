<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Field;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewsTest extends TestCase
{
    use RefreshDatabase;

    private function userToken(User &$user = null): string
    {
        $user = User::factory()->create();
        return $user->createToken('test')->plainTextToken;
    }

    private function createField(): Field
    {
        $owner = User::factory()->create();
        $club = Club::create([
            'user_id' => $owner->id,
            'name' => 'Club Center',
            'address' => 'Street 1',
        ]);

        return Field::create([
            'club_id' => $club->id,
            'name' => 'Field 1',
            'sport' => 'futbol',
            'price_per_hour' => 100,
        ]);
    }

    public function test_user_can_list_reviews(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();
        Review::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'rating' => 4,
            'comment' => 'Good field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields/' . $field->id . '/reviews');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'rating']]]);
    }

    public function test_user_can_show_review(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();
        $review = Review::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'rating' => 4,
            'comment' => 'Good field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/fields/' . $field->id . '/reviews/' . $review->id);

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $review->id]);
    }

    public function test_user_can_create_review(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/fields/' . $field->id . '/reviews', [
                'rating' => 5,
                'comment' => 'Excellent',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['rating' => 5]);
    }

    public function test_user_can_update_own_review(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();
        $review = Review::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'rating' => 4,
            'comment' => 'Good field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/fields/' . $field->id . '/reviews/' . $review->id, [
                'rating' => 3,
                'comment' => 'Okay',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['rating' => 3]);
    }

    public function test_user_can_delete_own_review(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();
        $review = Review::create([
            'user_id' => $user->id,
            'field_id' => $field->id,
            'rating' => 4,
            'comment' => 'Good field',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/v1/fields/' . $field->id . '/reviews/' . $review->id);

        $response->assertStatus(204);
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_validation_fails_with_invalid_rating(): void
    {
        $token = $this->userToken($user);
        $field = $this->createField();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/fields/' . $field->id . '/reviews', [
                'rating' => 6,
            ]);

        $response->assertStatus(422);
    }
}
