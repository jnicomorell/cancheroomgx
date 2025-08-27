<?php

namespace Tests\Unit\Notifications;

use App\Http\Controllers\Api\ReservationController;
use App\Http\Requests\ReservationRequest;
use App\Models\Club;
use App\Models\Field;
use App\Models\User;
use App\Notifications\ReservationReminderNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReservationReminderNotificationTest extends TestCase
{
    public function test_notification_is_queued_with_delay_when_reservation_is_created(): void
    {
        config([
            'app.key' => 'base64:'.base64_encode(random_bytes(32)),
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
            'queue.default' => 'sync',
        ]);

        Artisan::call('migrate');

        Notification::fake();

        $user = User::factory()->create();

        $club = Club::create([
            'user_id' => $user->id,
            'name' => 'Club',
            'address' => 'Addr',
            'lat' => 0,
            'lng' => 0,
        ]);

        $field = Field::create([
            'club_id' => $club->id,
            'name' => 'Field',
            'sport' => 'soccer',
            'surface' => 'grass',
            'indoor' => false,
            'lighting' => false,
            'price_per_hour' => 10,
        ]);

        $start = Carbon::now()->addHours(2);
        $end = $start->copy()->addHour();

        $request = ReservationRequest::create('/', 'POST', [
            'field_id' => $field->id,
            'start_time' => $start->toDateTimeString(),
            'end_time' => $end->toDateTimeString(),
            'total_price' => 100,
        ]);
        $request->setUserResolver(fn () => $user);

        $controller = new ReservationController();
        $controller->store($request);

        Notification::assertSentTo($user, ReservationReminderNotification::class);
        $notification = Notification::sent($user, ReservationReminderNotification::class)->first();
        $actual = $notification->delay instanceof \DateTimeInterface
            ? $notification->delay->getTimestamp()
            : $notification->delay;
        $this->assertSame($start->copy()->subHour()->getTimestamp(), $actual);
    }
}
