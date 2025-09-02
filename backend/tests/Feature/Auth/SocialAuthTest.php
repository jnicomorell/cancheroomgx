<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_callback_creates_user_and_returns_token(): void
    {
        config(['app.key' => 'base64:' . base64_encode(random_bytes(32))]);

        $socialUser = new SocialiteUser();
        $socialUser->map([
            'id' => '12345',
            'name' => 'Social User',
            'email' => 'social@example.com',
        ]);

        Socialite::shouldReceive('driver')->with('github')->andReturnSelf();
        Socialite::shouldReceive('stateless')->andReturnSelf();
        Socialite::shouldReceive('user')->andReturn($socialUser);

        $response = $this->get('/auth/github/callback');

        $response->assertStatus(200)->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', [
            'email' => 'social@example.com',
        ]);
    }
}
