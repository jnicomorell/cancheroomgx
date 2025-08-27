<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Reservation $reservation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reservation Reminder')
            ->line('You have an upcoming reservation at ' . $this->reservation->start_time->toDateTimeString())
            ->line('Thank you for using our application!');
    }
}
