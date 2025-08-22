<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
