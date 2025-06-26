<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\RedisService;
use Exception;

class RedisController
{
    private static function getRedis(): RedisService
    {
        return RedisService::getInstance();
    }
    
    public static function ping(): void
    {
        try {
            $redis = self::getRedis();
            $result = $redis->ping();
            
            $response = [
                'success' => true,
                'message' => 'Redis is connected',
                'data' => [
                    'ping' => $result,
                    'connected' => $redis->isConnected()
                ]
            ];
            
            http_response_code(200);
            echo json_encode($response, JSON_PRETTY_PRINT);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Redis connection failed',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function info(): void
    {
        try {
            $redis = self::getRedis();
            $info = $redis->info();
            
            $response = [
                'success' => true,
                'data' => ['info' => $info]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get Redis info',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function get(string $key): void
    {
        try {
            $redis = self::getRedis();
            $value = $redis->get($key);
            
            if ($value === null) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Key not found'
                ]);
                return;
            }
            
            $response = [
                'success' => true,
                'data' => ['key' => $key, 'value' => $value]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get cache value',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function set(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['key']) || !isset($input['value'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Key and value are required'
                ]);
                return;
            }
            
            $redis = self::getRedis();
            $ttl = $input['ttl'] ?? null;
            $success = $redis->set($input['key'], $input['value'], $ttl);
            
            if (!$success) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to set cache value'
                ]);
                return;
            }
            
            $response = [
                'success' => true,
                'message' => 'Cache value set successfully',
                'data' => [
                    'key' => $input['key'],
                    'value' => $input['value'],
                    'ttl' => $ttl ?? 'no expiration'
                ]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to set cache value',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function delete(string $key): void
    {
        try {
            $redis = self::getRedis();
            $result = $redis->delete($key);
            
            if ($result === 0) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Key not found'
                ]);
                return;
            }
            
            $response = [
                'success' => true,
                'message' => 'Cache value deleted successfully',
                'data' => ['key' => $key, 'deleted' => $result]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to delete cache value',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function keys(): void
    {
        try {
            $pattern = $_GET['pattern'] ?? '*';
            $redis = self::getRedis();
            $keys = $redis->keys($pattern);
            
            $response = [
                'success' => true,
                'data' => [
                    'pattern' => $pattern,
                    'keys' => $keys,
                    'count' => count($keys)
                ]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get keys',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function exists(string $key): void
    {
        try {
            $redis = self::getRedis();
            $exists = $redis->exists($key);
            
            $response = [
                'success' => true,
                'data' => ['key' => $key, 'exists' => $exists]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to check key existence',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function ttl(string $key): void
    {
        try {
            $redis = self::getRedis();
            $ttl = $redis->ttl($key);
            
            $message = '';
            if ($ttl === -1) {
                $message = 'Key exists but has no expiration';
            } elseif ($ttl === -2) {
                $message = 'Key does not exist';
            } else {
                $message = "Key expires in {$ttl} seconds";
            }
            
            $response = [
                'success' => true,
                'data' => ['key' => $key, 'ttl' => $ttl, 'message' => $message]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get TTL',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function increment(string $key): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $delta = $input['delta'] ?? 1;
            
            $redis = self::getRedis();
            $result = $redis->increment($key, $delta);
            
            $response = [
                'success' => true,
                'message' => 'Counter incremented successfully',
                'data' => ['key' => $key, 'delta' => $delta, 'newValue' => $result]
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to increment counter',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function flush(): void
    {
        try {
            $redis = self::getRedis();
            $result = $redis->flushAll();
            
            if (!$result) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to flush cache'
                ]);
                return;
            }
            
            $response = [
                'success' => true,
                'message' => 'All cache cleared successfully',
                'data' => ['result' => 'OK']
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to flush cache',
                'message' => $e->getMessage()
            ]);
        }
    }
} 