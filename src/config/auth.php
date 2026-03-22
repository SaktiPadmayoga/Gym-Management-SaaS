<?php

// Tambahkan ke config/auth.php

return [
    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],

        // Admin guard — central DB
        'admin' => [
            'driver'   => 'sanctum',
            'provider' => 'admins',
        ],

        // Staff guard — tenant DB (nanti)
        'staff' => [
            'driver'   => 'sanctum',
            'provider' => 'staffs',
        ],

        // Member guard — tenant DB (nanti)
        'member' => [
            'driver'   => 'sanctum',
            'provider' => 'members',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],

        'admins' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Admin::class,
        ],

        // Nanti setelah staff auth
        'staffs' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Tenant\Staff::class,
        ],

        // Nanti setelah member auth
        'members' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Tenant\Member::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];