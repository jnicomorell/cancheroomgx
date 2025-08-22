<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('recurring_rule')->nullable()->after('total_price');
            $table->foreignId('rescheduled_from_id')->nullable()->constrained('reservations')->nullOnDelete()->after('recurring_rule');
            $table->unsignedInteger('waitlist_position')->nullable()->after('rescheduled_from_id');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('recurring_rule');
            $table->dropForeign(['rescheduled_from_id']);
            $table->dropColumn('rescheduled_from_id');
            $table->dropColumn('waitlist_position');
        });
    }
};
