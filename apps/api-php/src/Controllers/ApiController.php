<?php
declare(strict_types=1);

namespace App\Controllers;

class ApiController
{
    public static function health(): void
    {
        $response = [
            'status' => 'ok',
            'timestamp' => date('c'),
            'uptime' => sys_getloadavg()[0],
            'environment' => $_ENV['APP_ENV'] ?? 'development',
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true)
        ];
        
        http_response_code(200);
        echo json_encode($response, JSON_PRETTY_PRINT);
    }
    
    public static function welcome(): void
    {
        $response = [
            'message' => 'Welcome to PHP API!',
            'version' => '1.0.0',
            'endpoints' => [
                'GET /health' => 'Health check',
                'GET /api/users' => 'Get all users',
                'GET /api/users/{id}' => 'Get user by ID',
                'POST /api/users' => 'Create user',
                'PUT /api/users/{id}' => 'Update user',
                'DELETE /api/users/{id}' => 'Delete user',
                'GET /api/cache/ping' => 'Redis health check',
                'GET /api/cache/info' => 'Redis info',
                'GET /api/cache/get/{key}' => 'Get cache value',
                'POST /api/cache/set' => 'Set cache value',
                'DELETE /api/cache/delete/{key}' => 'Delete cache value',
                'GET /api/cache/keys' => 'Get all keys',
                'GET /api/cache/exists/{key}' => 'Check if key exists',
                'GET /api/cache/ttl/{key}' => 'Get key TTL',
                'POST /api/cache/increment/{key}' => 'Increment counter',
                'DELETE /api/cache/flush' => 'Clear all cache'
            ],
            'documentation' => 'http://localhost:3005'
        ];
        
        http_response_code(200);
        echo json_encode($response, JSON_PRETTY_PRINT);
    }
} 