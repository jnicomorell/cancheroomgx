<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClubRequest;
use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index()
    {
        return Club::paginate();
    }

    public function store(ClubRequest $request)
    {
        $club = Club::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'address' => $request->address,
            'lat' => $request->lat,
            'lng' => $request->lng,
        ]);

        return response()->json($club, 201);
    }

    public function update(ClubRequest $request, Club $club)
    {
        $club->update($request->validated());

        return response()->json($club);
    }

    public function destroy(Club $club)
    {
        $club->delete();

        return response()->noContent();
    }
}

