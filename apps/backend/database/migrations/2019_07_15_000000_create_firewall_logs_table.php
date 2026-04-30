<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateFirewallLogsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('firewall_logs', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('ip');
            $table->string('level')->default('medium');
            $table->string('middleware');
            $table->integer('user_id')->nullable();
            $table->text('url')->nullable();
            $table->string('referrer')->nullable();
            $table->text('request')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('ip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('firewall_logs');
    }
}
