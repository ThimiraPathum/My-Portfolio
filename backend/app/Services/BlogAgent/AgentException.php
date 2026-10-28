<?php

namespace App\Services\BlogAgent;

use RuntimeException;

/** Only application-owned reason codes may be logged or printed. */
class AgentException extends RuntimeException
{
    public function __construct(public readonly string $reason)
    {
        parent::__construct($reason);
    }
}
