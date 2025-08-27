<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        config(['app.key' => env('APP_KEY', 'base64:'.base64_encode(random_bytes(32)))]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
