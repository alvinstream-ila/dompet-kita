<?php

namespace Tests\Unit;

use App\Services\BudgetService;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class BudgetServiceTest extends TestCase
{
    private BudgetService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BudgetService();
    }

    /**
     * @test
     */
    public function test_it_calculates_correct_dates_for_standard_month(): void
    {
        // Cycle starts on 1st, checking April 2024
        $dates = $this->service->getBudgetCycleDates(4, 2024, 1);

        $this->assertEquals('2024-04-01', $dates['start']->toDateString());
        $this->assertEquals('2024-04-30', $dates['end']->toDateString());
    }

    /**
     * @test
     */
    public function test_it_handles_overflow_for_31st_start_day(): void
    {
        // Cycle starts on 31st. April only has 30 days.
        // It should start on April 30th and end on May 29th (day before May 30th).
        $dates = $this->service->getBudgetCycleDates(4, 2024, 31);

        $this->assertEquals('2024-04-30', $dates['start']->toDateString());
        $this->assertEquals('2024-05-29', $dates['end']->toDateString());
    }

    /**
     * @test
     */
    public function test_it_handles_february_leap_year(): void
    {
        // Leap year 2024, starts on 31st (clamped to 29th)
        $dates = $this->service->getBudgetCycleDates(2, 2024, 31);

        $this->assertEquals('2024-02-29', $dates['start']->toDateString());
        $this->assertEquals('2024-03-28', $dates['end']->toDateString());
    }

    /**
     * @test
     */
    public function test_it_handles_february_non_leap_year(): void
    {
        // Non-leap year 2023, starts on 31st (clamped to 28th)
        $dates = $this->service->getBudgetCycleDates(2, 2023, 31);

        $this->assertEquals('2023-02-28', $dates['start']->toDateString());
        $this->assertEquals('2023-03-27', $dates['end']->toDateString());
    }

    /**
     * @test
     */
    public function test_it_correctly_identifies_current_cycle(): void
    {
        // Today is 2024-05-15. Cycle starts on 20th.
        // Current cycle should be 2024-04-20 to 2024-05-19 (approx).
        Carbon::setTestNow('2024-05-15');
        
        $dates = $this->service->getBudgetCycleDates(null, null, 20);

        $this->assertEquals('2024-04-20', $dates['start']->toDateString());
        
        Carbon::setTestNow(); // Reset
    }
}
