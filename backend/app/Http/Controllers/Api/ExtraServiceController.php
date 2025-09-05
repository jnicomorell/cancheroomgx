<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExtraService;
use App\Services\CurrencyService;
use Illuminate\Http\Request;

class ExtraServiceController extends Controller
{
    public function index(Request $request, CurrencyService $currency)
    {
        $currencyCode = strtoupper($request->query('currency', 'USD'));

        return ExtraService::all()->map(function ($service) use ($currency, $currencyCode) {
            $price = $currency->convert($service->price, $service->currency, $currencyCode);

            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $price,
                'currency' => $currencyCode,
            ];
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric'],
            'currency' => ['required', 'string', 'size:3'],
        ]);

        $service = ExtraService::create($data);

        return response()->json($service, 201);
    }
}
