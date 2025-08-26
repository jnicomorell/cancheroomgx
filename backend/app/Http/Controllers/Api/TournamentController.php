<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function index()
    {
        return Tournament::paginate();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'location' => ['nullable', 'string'],
        ]);

        $tournament = Tournament::create($data);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament)
    {
        return $tournament->load('teams');
    }

    public function update(Request $request, Tournament $tournament)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'location' => ['nullable', 'string'],
        ]);

        $tournament->update($data);

        return response()->json($tournament);
    }

    public function destroy(Tournament $tournament)
    {
        $tournament->delete();

        return response()->noContent();
    }

    public function register(Request $request, Tournament $tournament)
    {
        $data = $request->validate([
            'team_name' => ['required', 'string'],
        ]);

        $team = Team::create(['name' => $data['team_name']]);

        $registration = Registration::create([
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
        ]);

        return response()->json($registration->load('team', 'tournament'), 201);
    }
}
