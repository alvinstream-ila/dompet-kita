<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Services\Cfo\CfoAssistantService;

class ProcessScheduledTransactionsAction extends BaseAction
{
    public function __construct(
        private readonly CfoAssistantService $cfo
    ) {}

    /**
     * Process all due scheduled transactions.
     *
     * @return int The number of processed transactions.
     */
    public function execute(): int
    {
        return $this->cfo->processScheduledTransactions();
    }
}
