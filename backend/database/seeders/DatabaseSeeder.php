<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\Field;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $club = Club::create([
            'user_id' => $admin->id,
            'name' => 'Club Center',
            'address' => '123 Main St',
            'lat' => -34.6037,
            'lng' => -58.3816,
        ]);

        Field::create([
            'club_id' => $club->id,
            'name' => 'Cancha 1',
            'sport' => 'futbol',
            'surface' => 'cesped',
            'price_per_hour' => 100,
        ]);
    }
}
