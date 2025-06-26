<?php
declare(strict_types=1);

namespace App\Services;

use Predis\Client;
use Exception;

class RedisService
{
    private static ?self $instance = null;
    private ?Client $client = null;
    
    private function __construct()
    {
        $this->connect();
    }
    
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    private function connect(): void
    {
        try {
            $host = $_ENV['REDIS_HOST'] ?? 'redis';
            $port = (int)($_ENV['REDIS_PORT'] ?? '6379');
            $password = $_ENV['REDIS_PASSWORD'] ?? 'redis123';
            
            $this->client = new Client([
                'scheme' => 'tcp',
                'host' => $host,
                'port' => $port,
                'password' => $password,
            ]);
            
            // 测试连接
            $this->client->ping();
        } catch (Exception $e) {
            throw new Exception("Redis connection failed: " . $e->getMessage());
        }
    }
    
    public function getClient(): Client
    {
        if ($this->client === null) {
            $this->connect();
        }
        
        return $this->client;
    }
    
    // 基础操作
    public function set(string $key, $value, ?int $ttl = null): bool
    {
        try {
            $serializedValue = is_array($value) || is_object($value) 
                ? json_encode($value) 
                : (string)$value;
            
            if ($ttl !== null) {
                $result = $this->client->setex($key, $ttl, $serializedValue);
            } else {
                $result = $this->client->set($key, $serializedValue);
            }
            
            return $result === 'OK';
        } catch (Exception $e) {
            error_log("Redis set error: " . $e->getMessage());
            return false;
        }
    }
    
    public function get(string $key): ?string
    {
        try {
            return $this->client->get($key);
        } catch (Exception $e) {
            error_log("Redis get error: " . $e->getMessage());
            return null;
        }
    }
    
    public function getArray(string $key): ?array
    {
        $value = $this->get($key);
        if ($value === null) {
            return null;
        }
        
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : null;
    }
    
    public function delete(string $key): int
    {
        try {
            return $this->client->del([$key]);
        } catch (Exception $e) {
            error_log("Redis delete error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function exists(string $key): bool
    {
        try {
            return $this->client->exists($key) > 0;
        } catch (Exception $e) {
            error_log("Redis exists error: " . $e->getMessage());
            return false;
        }
    }
    
    // TTL操作
    public function expire(string $key, int $seconds): bool
    {
        try {
            return $this->client->expire($key, $seconds) === 1;
        } catch (Exception $e) {
            error_log("Redis expire error: " . $e->getMessage());
            return false;
        }
    }
    
    public function ttl(string $key): int
    {
        try {
            return $this->client->ttl($key);
        } catch (Exception $e) {
            error_log("Redis ttl error: " . $e->getMessage());
            return -2;
        }
    }
    
    // 列表操作
    public function listPush(string $key, string ...$values): int
    {
        try {
            return $this->client->lpush($key, $values);
        } catch (Exception $e) {
            error_log("Redis listPush error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function listPop(string $key): ?string
    {
        try {
            return $this->client->lpop($key);
        } catch (Exception $e) {
            error_log("Redis listPop error: " . $e->getMessage());
            return null;
        }
    }
    
    public function listLength(string $key): int
    {
        try {
            return $this->client->llen($key);
        } catch (Exception $e) {
            error_log("Redis listLength error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function listRange(string $key, int $start = 0, int $stop = -1): array
    {
        try {
            return $this->client->lrange($key, $start, $stop);
        } catch (Exception $e) {
            error_log("Redis listRange error: " . $e->getMessage());
            return [];
        }
    }
    
    // 集合操作
    public function setAdd(string $key, string ...$members): int
    {
        try {
            return $this->client->sadd($key, $members);
        } catch (Exception $e) {
            error_log("Redis setAdd error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function setMembers(string $key): array
    {
        try {
            return $this->client->smembers($key);
        } catch (Exception $e) {
            error_log("Redis setMembers error: " . $e->getMessage());
            return [];
        }
    }
    
    public function setIsMember(string $key, string $member): bool
    {
        try {
            return $this->client->sismember($key, $member) === 1;
        } catch (Exception $e) {
            error_log("Redis setIsMember error: " . $e->getMessage());
            return false;
        }
    }
    
    // 哈希操作
    public function hashSet(string $key, string $field, string $value): int
    {
        try {
            return $this->client->hset($key, $field, $value);
        } catch (Exception $e) {
            error_log("Redis hashSet error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function hashGet(string $key, string $field): ?string
    {
        try {
            return $this->client->hget($key, $field);
        } catch (Exception $e) {
            error_log("Redis hashGet error: " . $e->getMessage());
            return null;
        }
    }
    
    public function hashGetAll(string $key): array
    {
        try {
            return $this->client->hgetall($key);
        } catch (Exception $e) {
            error_log("Redis hashGetAll error: " . $e->getMessage());
            return [];
        }
    }
    
    public function hashDelete(string $key, string $field): int
    {
        try {
            return $this->client->hdel($key, [$field]);
        } catch (Exception $e) {
            error_log("Redis hashDelete error: " . $e->getMessage());
            return 0;
        }
    }
    
    // 计数器
    public function increment(string $key, int $delta = 1): int
    {
        try {
            return $this->client->incrby($key, $delta);
        } catch (Exception $e) {
            error_log("Redis increment error: " . $e->getMessage());
            return 0;
        }
    }
    
    public function decrement(string $key, int $delta = 1): int
    {
        try {
            return $this->client->decrby($key, $delta);
        } catch (Exception $e) {
            error_log("Redis decrement error: " . $e->getMessage());
            return 0;
        }
    }
    
    // 键操作
    public function keys(string $pattern = '*'): array
    {
        try {
            return $this->client->keys($pattern);
        } catch (Exception $e) {
            error_log("Redis keys error: " . $e->getMessage());
            return [];
        }
    }
    
    public function flushAll(): bool
    {
        try {
            return $this->client->flushall() === 'OK';
        } catch (Exception $e) {
            error_log("Redis flushAll error: " . $e->getMessage());
            return false;
        }
    }
    
    // 连接管理
    public function ping(): string
    {
        try {
            return $this->client->ping() ?? 'PONG';
        } catch (Exception $e) {
            error_log("Redis ping error: " . $e->getMessage());
            return 'ERROR: ' . $e->getMessage();
        }
    }
    
    public function info(): string
    {
        try {
            return $this->client->info();
        } catch (Exception $e) {
            error_log("Redis info error: " . $e->getMessage());
            return 'ERROR: ' . $e->getMessage();
        }
    }
    
    public function isConnected(): bool
    {
        try {
            return $this->ping() === 'PONG';
        } catch (Exception $e) {
            return false;
        }
    }
    
    // 防止克隆
    private function __clone() {}
    
    // 防止反序列化
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize a singleton.");
    }
} 