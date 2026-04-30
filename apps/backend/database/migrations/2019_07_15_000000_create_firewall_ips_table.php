<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateFirewallIpsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('firewall_ips', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('ip');
            $table->integer('log_id')->nullable();
            $table->boolean('blocked')->default(1);
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
        Schema::drop('firewall_ips');
    }
}
