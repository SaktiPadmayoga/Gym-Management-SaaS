<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'https://fitnice.com',
        'https://*.fitnice.com',
    ],

    'allowed_origins_patterns' => [
        '#^http://[a-z0-9-]+\.localhost(:\d+)?$#',
        '#^https://[a-z0-9-]+\.fitnice\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // ← wajib
];