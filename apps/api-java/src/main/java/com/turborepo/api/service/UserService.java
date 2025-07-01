package com.turborepo.api.service;

import com.turborepo.api.model.User;
import com.turborepo.api.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String USER_CACHE_PREFIX = "user:";
    private static final int CACHE_TTL_HOURS = 24;

    public List<User> getAllUsers() {
        return userRepository.findAllActiveUsers();
    }

    public Optional<User> getUserById(Long id) {
        // Try cache first
        String cacheKey = USER_CACHE_PREFIX + id;
        User cachedUser = (User) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedUser != null) {
            return Optional.of(cachedUser);
        }

        // If not in cache, get from database
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent() && user.get().getIsActive()) {
            // Cache the user
            redisTemplate.opsForValue().set(cacheKey, user.get(), CACHE_TTL_HOURS, TimeUnit.HOURS);
            return user;
        }

        return Optional.empty();
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findActiveUserByEmail(email);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findActiveUserByUsername(username);
    }

    public User createUser(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);
        user.setEmailVerified(false);
        
        User savedUser = userRepository.save(user);
        
        // Cache the new user
        String cacheKey = USER_CACHE_PREFIX + savedUser.getId();
        redisTemplate.opsForValue().set(cacheKey, savedUser, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return savedUser;
    }

    public Optional<User> updateUser(Long id, User userUpdates) {
        Optional<User> existingUser = userRepository.findById(id);
        
        if (existingUser.isPresent() && existingUser.get().getIsActive()) {
            User user = existingUser.get();
            
            if (userUpdates.getUsername() != null) {
                user.setUsername(userUpdates.getUsername());
            }
            if (userUpdates.getEmail() != null) {
                user.setEmail(userUpdates.getEmail());
            }
            if (userUpdates.getName() != null) {
                user.setName(userUpdates.getName());
            }
            if (userUpdates.getAvatar() != null) {
                user.setAvatar(userUpdates.getAvatar());
            }
            if (userUpdates.getEmailVerified() != null) {
                user.setEmailVerified(userUpdates.getEmailVerified());
            }
            
            user.setUpdatedAt(LocalDateTime.now());
            User updatedUser = userRepository.save(user);
            
            // Update cache
            String cacheKey = USER_CACHE_PREFIX + id;
            redisTemplate.opsForValue().set(cacheKey, updatedUser, CACHE_TTL_HOURS, TimeUnit.HOURS);
            
            return Optional.of(updatedUser);
        }
        
        return Optional.empty();
    }

    public boolean deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        
        if (user.isPresent() && user.get().getIsActive()) {
            // Soft delete
            User userToDelete = user.get();
            userToDelete.setIsActive(false);
            userToDelete.setUpdatedAt(LocalDateTime.now());
            userRepository.save(userToDelete);
            
            // Remove from cache
            String cacheKey = USER_CACHE_PREFIX + id;
            redisTemplate.delete(cacheKey);
            
            return true;
        }
        
        return false;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public long getTotalActiveUsers() {
        return userRepository.countActiveUsers();
    }

    public void updateLastLogin(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent() && user.get().getIsActive()) {
            User userEntity = user.get();
            userEntity.setLastLogin(LocalDateTime.now());
            userEntity.setUpdatedAt(LocalDateTime.now());
            userRepository.save(userEntity);
            
            // Update cache
            String cacheKey = USER_CACHE_PREFIX + userId;
            redisTemplate.opsForValue().set(cacheKey, userEntity, CACHE_TTL_HOURS, TimeUnit.HOURS);
        }
    }

} 