<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when market data fetching or failover fails in the MarketService.
 */
class MarketServiceException extends Exception {}
