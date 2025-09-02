<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FieldRequest;
use App\Models\Field;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        $query = Field::with('club');

        if ($sport = $request->query('sport')) {
            $query->where('sport', $sport);
        }

        if ($min = $request->query('price_min')) {
            $query->where('price_per_hour', '>=', $min);
        }

        if ($max = $request->query('price_max')) {
            $query->where('price_per_hour', '<=', $max);
        }

        return $query->paginate();
    }

    public function store(FieldRequest $request)
    {
        $field = Field::create($request->validated());

        return response()->json($field, 201);
    }

    public function show(Field $field)
    {
        return $field->load('club');
    }

    public function update(FieldRequest $request, Field $field)
    {
        $field->update($request->validated());

        return response()->json($field);
    }

    public function destroy(Field $field)
    {
        $field->delete();

        return response()->noContent();
    }
}

