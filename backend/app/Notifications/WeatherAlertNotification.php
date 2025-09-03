<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WeatherAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Reservation $reservation, public array $weather)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $current = $this->weather['current_weather'] ?? [];
        $description = $current['weathercode'] ?? '';
        $temperature = $current['temperature'] ?? '';

        return (new MailMessage)
            ->subject('Weather Alert')
            ->line('Upcoming reservation at ' . $this->reservation->start_time->toDateTimeString())
            ->line('Weather code: ' . $description)
            ->line('Temperature: ' . $temperature);
    }
}
