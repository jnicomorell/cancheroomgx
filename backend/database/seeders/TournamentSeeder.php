<?php

namespace Database\Seeders;

use App\Models\Tournament;
use Illuminate\Database\Seeder;

class TournamentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tournament::create([
            'name' => 'Summer Cup',
            'start_date' => now()->addMonth()->toDateString(),
            'end_date' => now()->addMonths(2)->toDateString(),
            'location' => 'Main Stadium',
        ]);
    }
}
