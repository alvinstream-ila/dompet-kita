<?php

namespace Database\Seeders;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionSeeder extends Seeder
{
    /**
     * Seed the application's database for Alvin & Ila.
     */
    public function run(): void
    {
        // 1. Create a Shared Household
        $household = Household::updateOrCreate(
            ['name' => 'The Sovereign Family'],
            ['id' => Str::uuid()]
        );

        // 2. Create Alvin (Placeholder)
        $alvin = User::updateOrCreate(
            ['email' => 'alvin@placeholder.com'],
            [
                'name' => 'Muhammad Alvin',
                'password' => Hash::make('password123'),
                'currency_format' => 'IDR',
                'legacy_partner_email' => 'ila@placeholder.com',
                'household_id' => $household->id,
            ]
        );

        // 3. Create Ila (Placeholder)
        $ila = User::updateOrCreate(
            ['email' => 'ila@placeholder.com'],
            [
                'name' => 'Ila',
                'password' => Hash::make('password123'),
                'currency_format' => 'IDR',
                'legacy_partner_email' => 'alvin@placeholder.com',
                'household_id' => $household->id,
            ]
        );

        // 4. Update Household Owner
        $household->update(['owner_id' => $alvin->id]);

        // 5. Establish Couple Relationship
        $alvin->update(['partner_id' => $ila->id]);
        $ila->update(['partner_id' => $alvin->id]);

        $this->command->info('✅ Sovereign Account Created: Alvin & Ila are now linked in a shared household!');
    }
}
