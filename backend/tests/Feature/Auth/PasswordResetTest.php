<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_reset_password(): void
    {
        Notification::fake();

        config(['app.key' => 'base64:' . base64_encode(random_bytes(32))]);

        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'john@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['status' => trans(Password::RESET_LINK_SENT)]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;
            return true;
        });

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['status' => trans(Password::PASSWORD_RESET)]);

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }
}
