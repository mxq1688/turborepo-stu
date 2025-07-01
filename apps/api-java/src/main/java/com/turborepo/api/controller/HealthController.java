package com.turborepo.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> checks = new HashMap<>();
        boolean allHealthy = true;

        // Check database connection
        try {
            Connection connection = dataSource.getConnection();
            connection.close();
            checks.put("database", Map.of("status", "healthy", "message", "MySQL connection successful"));
        } catch (Exception e) {
            checks.put("database", Map.of("status", "unhealthy", "message", "MySQL connection failed: " + e.getMessage()));
            allHealthy = false;
        }

        // Check Redis connection
        try {
            redisTemplate.opsForValue().set("health_check", "test", 10, java.util.concurrent.TimeUnit.SECONDS);
            String result = (String) redisTemplate.opsForValue().get("health_check");
            if ("test".equals(result)) {
                checks.put("redis", Map.of("status", "healthy", "message", "Redis connection successful"));
            } else {
                checks.put("redis", Map.of("status", "unhealthy", "message", "Redis read/write failed"));
                allHealthy = false;
            }
        } catch (Exception e) {
            checks.put("redis", Map.of("status", "unhealthy", "message", "Redis connection failed: " + e.getMessage()));
            allHealthy = false;
        }

        response.put("status", allHealthy ? "healthy" : "unhealthy");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("service", "Turborepo Java API");
        response.put("version", "0.1.0");
        response.put("environment", "development");
        response.put("checks", checks);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "☕ Turborepo Java API");
        response.put("version", "0.1.0");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("endpoints", Map.of(
            "health", "/health",
            "users", "/api/users",
            "actuator", "/actuator"
        ));

        return ResponseEntity.ok(response);
    }

} 