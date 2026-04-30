<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Hardening financial precision to Industry Standard 2025.
     */
    public function up(): void
    {
        // 1. Transactions Precision & Soft Deletes
        Schema::table('transactions', function (Blueprint $table): void {
            $table->decimal('amount', 19, 4)->change();
            if (! Schema::hasColumn('transactions', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 2. Assets Hardening (Value, Quantity, Unit)
        Schema::table('assets', function (Blueprint $table): void {
            $table->decimal('value', 19, 4)->change();
            if (! Schema::hasColumn('assets', 'quantity')) {
                $table->decimal('quantity', 36, 18)->default(0)->after('value');
            }
            if (! Schema::hasColumn('assets', 'unit')) {
                $table->string('unit')->default('IDR')->after('quantity'); // Gram, Lot, BTC, etc.
            }
            if (! Schema::hasColumn('assets', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 3. Asset Transactions Hardening
        if (Schema::hasTable('asset_transactions')) {
            Schema::table('asset_transactions', function (Blueprint $table): void {
                $table->decimal('amount', 19, 4)->change();
                if (! Schema::hasColumn('asset_transactions', 'quantity')) {
                    $table->decimal('quantity', 36, 18)->default(0)->after('amount');
                }
                if (! Schema::hasColumn('asset_transactions', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // 4. Loans Precision & Soft Deletes
        Schema::table('loans', function (Blueprint $table): void {
            $table->decimal('amount', 19, 4)->change();
            $table->decimal('remaining_amount', 19, 4)->change();
            if (! Schema::hasColumn('loans', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 5. Goals & Holidays Soft Deletes
        Schema::table('goals', function (Blueprint $table): void {
            if (! Schema::hasColumn('goals', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('holidays', function (Blueprint $table): void {
            if (! Schema::hasColumn('holidays', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->decimal('amount', 15, 2)->change();
            $table->dropSoftDeletes();
        });

        Schema::table('assets', function (Blueprint $table): void {
            $table->decimal('value', 15, 2)->change();
            $table->dropColumn(['quantity', 'unit']);
            $table->dropSoftDeletes();
        });

        if (Schema::hasTable('asset_transactions')) {
            Schema::table('asset_transactions', function (Blueprint $table): void {
                $table->decimal('amount', 15, 2)->change();
                $table->dropColumn('quantity');
                $table->dropSoftDeletes();
            });
        }

        Schema::table('loans', function (Blueprint $table): void {
            $table->decimal('amount', 15, 2)->change();
            $table->decimal('remaining_amount', 15, 2)->change();
            $table->dropSoftDeletes();
        });

        Schema::table('goals', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });

        Schema::table('holidays', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });
    }
};
