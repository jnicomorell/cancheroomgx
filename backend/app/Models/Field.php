<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Field extends Model
{
    protected $fillable = [
        'club_id',
        'name',
        'sport',
        'surface',
        'indoor',
        'lighting',
        'price_per_hour',
    ];

    protected $casts = [
        'indoor' => 'boolean',
        'lighting' => 'boolean',
    ];

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
