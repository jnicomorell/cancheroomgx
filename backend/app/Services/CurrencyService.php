<?php

namespace App\Services;

class CurrencyService
{
    protected array $rates = [
        'USD' => 1,
        'EUR' => 0.9,
        'ARS' => 350,
    ];

    public function convert(float $amount, string $from = 'USD', string $to = 'USD'): float
    {
        if (!isset($this->rates[$from]) || !isset($this->rates[$to])) {
            return $amount;
        }

        $usd = $amount / $this->rates[$from];
        return round($usd * $this->rates[$to], 2);
    }
}
