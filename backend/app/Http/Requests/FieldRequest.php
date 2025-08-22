<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'club_id' => 'required|exists:clubs,id',
            'name' => 'required|string|max:255',
            'sport' => 'required|string|max:255',
            'surface' => 'nullable|string|max:255',
            'indoor' => 'boolean',
            'lighting' => 'boolean',
            'price_per_hour' => 'required|numeric',
        ];
    }
}

