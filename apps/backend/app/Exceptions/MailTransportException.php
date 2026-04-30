<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when the custom mail transport (e.g. Gmail HTTP) fails.
 */
class MailTransportException extends Exception {}
