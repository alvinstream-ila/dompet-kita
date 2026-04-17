<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('invested_capital', 20, 2)->default(0)->after('value');
        });

        // Initialize invested_capital with current value for existing assets
        // so that the first report isn't a 100% "profit" spike
        DB::table('assets')->update([
            'invested_capital' => DB::raw('value'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('invested_capital');
        });
    }
};
