<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use App\Controllers\ApiController;
use App\Controllers\UserController;
use App\Controllers\RedisController;

// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 简单的路由系统
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// 移除基础路径（如果有的话）
$path = str_replace('/index.php', '', $requestUri);
$path = trim($path, '/');

// 路由匹配
try {
    switch (true) {
        case $path === 'health' && $requestMethod === 'GET':
            ApiController::health();
            break;
            
        // 用户API路由
        case $path === 'api/users' && $requestMethod === 'GET':
            UserController::getAllUsers();
            break;
            
        case preg_match('/^api\/users\/(\d+)$/', $path, $matches) && $requestMethod === 'GET':
            UserController::getUserById((int)$matches[1]);
            break;
            
        case $path === 'api/users' && $requestMethod === 'POST':
            UserController::createUser();
            break;
            
        case preg_match('/^api\/users\/(\d+)$/', $path, $matches) && $requestMethod === 'PUT':
            UserController::updateUser((int)$matches[1]);
            break;
            
        case preg_match('/^api\/users\/(\d+)$/', $path, $matches) && $requestMethod === 'DELETE':
            UserController::deleteUser((int)$matches[1]);
            break;
            
        // Redis/Cache API路由
        case $path === 'api/cache/ping' && $requestMethod === 'GET':
            RedisController::ping();
            break;
            
        case $path === 'api/cache/info' && $requestMethod === 'GET':
            RedisController::info();
            break;
            
        case preg_match('/^api\/cache\/get\/(.+)$/', $path, $matches) && $requestMethod === 'GET':
            RedisController::get($matches[1]);
            break;
            
        case $path === 'api/cache/set' && $requestMethod === 'POST':
            RedisController::set();
            break;
            
        case preg_match('/^api\/cache\/delete\/(.+)$/', $path, $matches) && $requestMethod === 'DELETE':
            RedisController::delete($matches[1]);
            break;
            
        case $path === 'api/cache/keys' && $requestMethod === 'GET':
            RedisController::keys();
            break;
            
        case preg_match('/^api\/cache\/exists\/(.+)$/', $path, $matches) && $requestMethod === 'GET':
            RedisController::exists($matches[1]);
            break;
            
        case preg_match('/^api\/cache\/ttl\/(.+)$/', $path, $matches) && $requestMethod === 'GET':
            RedisController::ttl($matches[1]);
            break;
            
        case preg_match('/^api\/cache\/increment\/(.+)$/', $path, $matches) && $requestMethod === 'POST':
            RedisController::increment($matches[1]);
            break;
            
        case $path === 'api/cache/flush' && $requestMethod === 'DELETE':
            RedisController::flush();
            break;
            
        case $path === '':
            ApiController::welcome();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage()
    ]);
} 