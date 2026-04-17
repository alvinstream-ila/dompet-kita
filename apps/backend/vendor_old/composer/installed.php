<?php

return [
    'root' => [
        'name' => 'laravel/laravel',
        'pretty_version' => 'dev-main',
        'version' => 'dev-main',
        'reference' => 'a6ebb0e9e2f50a313261424720e7b0fd58dd542c',
        'type' => 'project',
        'install_path' => __DIR__.'/../../',
        'aliases' => [],
        'dev' => true,
    ],
    'versions' => [
        'dealerdirect/phpcodesniffer-composer-installer' => [
            'pretty_version' => 'v1.2.0',
            'version' => '1.2.0.0',
            'reference' => '845eb62303d2ca9b289ef216356568ccc075ffd1',
            'type' => 'composer-plugin',
            'install_path' => __DIR__.'/../dealerdirect/phpcodesniffer-composer-installer',
            'aliases' => [],
            'dev_requirement' => true,
        ],
        'laravel/laravel' => [
            'pretty_version' => 'dev-main',
            'version' => 'dev-main',
            'reference' => 'a6ebb0e9e2f50a313261424720e7b0fd58dd542c',
            'type' => 'project',
            'install_path' => __DIR__.'/../../',
            'aliases' => [],
            'dev_requirement' => false,
        ],
        'pestphp/pest-plugin' => [
            'pretty_version' => 'v4.0.0',
            'version' => '4.0.0.0',
            'reference' => '9d4b93d7f73d3f9c3189bb22c220fef271cdf568',
            'type' => 'composer-plugin',
            'install_path' => __DIR__.'/../pestphp/pest-plugin',
            'aliases' => [],
            'dev_requirement' => true,
        ],
        'php-http/async-client-implementation' => [
            'dev_requirement' => false,
            'provided' => [
                0 => '*',
            ],
        ],
        'php-http/client-implementation' => [
            'dev_requirement' => false,
            'provided' => [
                0 => '*',
            ],
        ],
        'php-http/discovery' => [
            'pretty_version' => '1.20.0',
            'version' => '1.20.0.0',
            'reference' => '82fe4c73ef3363caed49ff8dd1539ba06044910d',
            'type' => 'composer-plugin',
            'install_path' => __DIR__.'/../php-http/discovery',
            'aliases' => [],
            'dev_requirement' => false,
        ],
        'psr/http-client-implementation' => [
            'dev_requirement' => false,
            'provided' => [
                0 => '*',
            ],
        ],
        'psr/http-factory-implementation' => [
            'dev_requirement' => false,
            'provided' => [
                0 => '*',
            ],
        ],
        'psr/http-message-implementation' => [
            'dev_requirement' => false,
            'provided' => [
                0 => '*',
            ],
        ],
        'squizlabs/php_codesniffer' => [
            'pretty_version' => '3.13.5',
            'version' => '3.13.5.0',
            'reference' => '0ca86845ce43291e8f5692c7356fccf3bcf02bf4',
            'type' => 'library',
            'install_path' => __DIR__.'/../squizlabs/php_codesniffer',
            'aliases' => [],
            'dev_requirement' => true,
        ],
    ],
];
