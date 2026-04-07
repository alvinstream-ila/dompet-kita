<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    /**
     * Seed the application's database for Alvin & Ila.
     */
    public function run(): void
    {
        // 1. Create Alvin (Placeholder)
        $alvin = User::updateOrCreate(
            ['email' => 'alvin@placeholder.com'],
            [
                'name' => 'Muhammad Alvin',
                'password' => Hash::make('password123'),
                'target_currency' => 'IDR',
                'partner_email' => 'ila@placeholder.com',
            ]
        );

        // 2. Create Ila (Placeholder)
        $ila = User::updateOrCreate(
            ['email' => 'ila@placeholder.com'],
            [
                'name' => 'Ila',
                'password' => Hash::make('password123'),
                'target_currency' => 'IDR',
                'partner_email' => 'alvin@placeholder.com',
            ]
        );

        // 3. Establish Couple Relationship
        $alvin->update(['partner_id' => $ila->id]);
        $ila->update(['partner_id' => $alvin->id]);

        $this->command->info('✅ Sovereign Account Created: Alvin & Ila are now linked!');
    }
}
