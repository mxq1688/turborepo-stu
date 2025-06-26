<?php
declare(strict_types=1);

namespace App\Services;

use PDO;
use PDOException;
use Exception;

class DatabaseService
{
    private static ?self $instance = null;
    private ?PDO $connection = null;
    
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
            $host = $_ENV['DB_HOST'] ?? 'mysql';
            $port = $_ENV['DB_PORT'] ?? '3306';
            $database = $_ENV['DB_DATABASE'] ?? 'turborepo_dev';
            $username = $_ENV['DB_USERNAME'] ?? 'developer';
            $password = $_ENV['DB_PASSWORD'] ?? 'dev123';
            
            $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection(): PDO
    {
        if ($this->connection === null) {
            $this->connect();
        }
        
        return $this->connection;
    }
    
    public function isConnected(): bool
    {
        try {
            return $this->connection !== null && $this->connection->query('SELECT 1');
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function disconnect(): void
    {
        $this->connection = null;
    }
    
    // 防止克隆
    private function __clone() {}
    
    // 防止反序列化
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize a singleton.");
    }
} 