<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;
use App\Services\DatabaseService;
use Exception;

class UserController
{
    private static function getDatabase(): DatabaseService
    {
        return DatabaseService::getInstance();
    }
    
    public static function getAllUsers(): void
    {
        try {
            $db = self::getDatabase();
            $stmt = $db->getConnection()->query("SELECT * FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $response = [
                'success' => true,
                'data' => $users,
                'count' => count($users),
                'message' => 'Users retrieved successfully'
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to retrieve users',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function getUserById(int $id): void
    {
        try {
            $db = self::getDatabase();
            $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
                return;
            }
            
            $response = [
                'success' => true,
                'data' => $user
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to retrieve user',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function createUser(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['email']) || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Email and name are required'
                ]);
                return;
            }
            
            $db = self::getDatabase();
            
            // 检查邮箱是否已存在
            $stmt = $db->getConnection()->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->bindParam(':email', $input['email']);
            $stmt->execute();
            
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => 'User with this email already exists'
                ]);
                return;
            }
            
            // 创建用户
            $avatar = $input['avatar'] ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($input['name']);
            
            $stmt = $db->getConnection()->prepare("
                INSERT INTO users (email, name, avatar, created_at, updated_at) 
                VALUES (:email, :name, :avatar, NOW(), NOW())
            ");
            
            $stmt->bindParam(':email', $input['email']);
            $stmt->bindParam(':name', $input['name']);
            $stmt->bindParam(':avatar', $avatar);
            $stmt->execute();
            
            $userId = $db->getConnection()->lastInsertId();
            
            // 获取创建的用户
            $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            $response = [
                'success' => true,
                'data' => $user,
                'message' => 'User created successfully'
            ];
            
            http_response_code(201);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create user',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function updateUser(int $id): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $db = self::getDatabase();
            
            // 检查用户是否存在
            $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
                return;
            }
            
            // 构建更新查询
            $updateFields = [];
            $params = [':id' => $id];
            
            if (isset($input['name'])) {
                $updateFields[] = 'name = :name';
                $params[':name'] = $input['name'];
            }
            
            if (isset($input['avatar'])) {
                $updateFields[] = 'avatar = :avatar';
                $params[':avatar'] = $input['avatar'];
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No valid fields to update'
                ]);
                return;
            }
            
            $updateFields[] = 'updated_at = NOW()';
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
            
            $stmt = $db->getConnection()->prepare($sql);
            $stmt->execute($params);
            
            // 获取更新后的用户
            $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            $updatedUser = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            $response = [
                'success' => true,
                'data' => $updatedUser,
                'message' => 'User updated successfully'
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update user',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public static function deleteUser(int $id): void
    {
        try {
            $db = self::getDatabase();
            
            // 检查用户是否存在
            $stmt = $db->getConnection()->prepare("SELECT id FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
                return;
            }
            
            // 删除用户
            $stmt = $db->getConnection()->prepare("DELETE FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            
            $response = [
                'success' => true,
                'message' => 'User deleted successfully'
            ];
            
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to delete user',
                'message' => $e->getMessage()
            ]);
        }
    }
} 