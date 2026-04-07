<?php

use App\Services\LegacyService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('market:sync')->dailyAt('09:00');
Schedule::command('backup:database')->dailyAt('00:00');
Schedule::command('ai:guardian')->dailyAt('08:00');
Schedule::command('ai:self-heal --auto-fix')->dailyAt('03:00');

// 🛡️ Phase 5: Digital Legacy Sentinel (Dead Man's Switch)
Schedule::call(function () {
    app(LegacyService::class)->checkAndTriggerDeadMansSwitch();
})->dailyAt('02:00');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
