<?php
header('Content-Type: application/json');
echo json_encode([
    'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? null,
    'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? null,
    'HTTP_X_FORWARDED_HOST' => $_SERVER['HTTP_X_FORWARDED_HOST'] ?? null,
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? null,
    'SERVER_PORT' => $_SERVER['SERVER_PORT'] ?? null,
    'HEADERS' => function_exists('getallheaders') ? getallheaders() : [],
], JSON_PRETTY_PRINT);
