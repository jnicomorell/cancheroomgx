<?php

namespace Database\Seeders;

use App\Models\Registration;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tournament = Tournament::first();
        $team = Team::first();

        if ($tournament && $team) {
            Registration::create([
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
            ]);
        }
    }
}
