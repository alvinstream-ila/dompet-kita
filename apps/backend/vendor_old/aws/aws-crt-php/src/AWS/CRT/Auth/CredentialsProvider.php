<?php

/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

namespace AWS\CRT\Auth;

use AWS\CRT\NativeResource;

/**
 * Base class for credentials providers
 */
abstract class CredentialsProvider extends NativeResource
{
    public function __construct(array $options = [])
    {
        parent::__construct();
    }

    public function __destruct()
    {
        self::$crt->credentials_provider_release($this->release());
        parent::__destruct();
    }
}
