<?php
declare(strict_types=1);

namespace App\Models;

class User
{
    private int $id;
    private string $email;
    private string $name;
    private ?string $avatar;
    private string $createdAt;
    private string $updatedAt;
    
    public function __construct(array $data = [])
    {
        if (!empty($data)) {
            $this->fill($data);
        }
    }
    
    public function fill(array $data): void
    {
        $this->id = $data['id'] ?? 0;
        $this->email = $data['email'] ?? '';
        $this->name = $data['name'] ?? '';
        $this->avatar = $data['avatar'] ?? null;
        $this->createdAt = $data['created_at'] ?? '';
        $this->updatedAt = $data['updated_at'] ?? '';
    }
    
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
    
    // Getters
    public function getId(): int
    {
        return $this->id;
    }
    
    public function getEmail(): string
    {
        return $this->email;
    }
    
    public function getName(): string
    {
        return $this->name;
    }
    
    public function getAvatar(): ?string
    {
        return $this->avatar;
    }
    
    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }
    
    public function getUpdatedAt(): string
    {
        return $this->updatedAt;
    }
    
    // Setters
    public function setEmail(string $email): void
    {
        $this->email = $email;
    }
    
    public function setName(string $name): void
    {
        $this->name = $name;
    }
    
    public function setAvatar(?string $avatar): void
    {
        $this->avatar = $avatar;
    }
} 