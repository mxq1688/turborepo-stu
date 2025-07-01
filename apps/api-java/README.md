# ☕ Turborepo Java API

Java Spring Boot API service for the Turborepo monorepo project.

## 🚀 Features

- **Spring Boot 3.2** with Java 17
- **MySQL** database with JPA/Hibernate
- **Redis** caching and session storage
- **RESTful API** with comprehensive user management
- **Docker support** for containerized deployment
- **Health checks** with actuator endpoints
- **Validation** with Bean Validation (JSR-303)
- **CORS support** for cross-origin requests

## 🏗️ Tech Stack

- **Java 17** - Programming language
- **Spring Boot 3.2** - Application framework
- **Spring Data JPA** - Database access layer
- **Spring Data Redis** - Redis integration
- **MySQL 8.0** - Primary database
- **Redis 7** - Caching and session store
- **Maven** - Build tool
- **Docker** - Containerization

## 📋 API Endpoints

### Health Check
- `GET /health` - Application health status
- `GET /` - Root endpoint with service info
- `GET /actuator/health` - Spring Boot actuator health

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (soft delete)
- `GET /api/users/stats` - Get user statistics

## 🔧 Development

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker & Docker Compose (for containerized mode)
- MySQL 8.0 (for local development)
- Redis 7 (for local development)

### Local Development (Maven)

```bash
# Navigate to Java API directory
cd apps/api-java

# Install dependencies and build
mvn clean package -DskipTests

# Run locally (requires MySQL and Redis running)
npm run dev:local
# or
mvn spring-boot:run -Dspring-boot.run.profiles=development
```

### Docker Development (Recommended)

```bash
# From project root
npm run java:build  # Build Docker image
npm run java:up     # Start Java API container

# View logs
npm run java:logs

# Access container shell
npm run java:shell

# Stop container
npm run java:down
```

### One-command startup (All services)

```bash
# Start all services including Java API
npm run services:up
```

## 🌐 Access Points

- **API Base URL**: http://localhost:3006
- **Health Check**: http://localhost:3006/health
- **User API**: http://localhost:3006/api/users
- **Actuator**: http://localhost:3006/actuator

## 🗄️ Database Schema

The Java API uses the same MySQL database (`turborepo_dev`) as other services.

### User Entity Fields
```java
- id (Long) - Primary key
- username (String) - Unique username
- email (String) - Unique email address
- passwordHash (String) - Encrypted password
- name (String) - Display name
- avatar (String) - Avatar URL
- emailVerified (Boolean) - Email verification status
- isActive (Boolean) - Account active status
- lastLogin (LocalDateTime) - Last login timestamp
- createdAt (LocalDateTime) - Creation timestamp
- updatedAt (LocalDateTime) - Last update timestamp
```

## ⚡ Redis Caching

The Java API implements intelligent Redis caching:

- **User Cache**: Users are cached for 24 hours with key `user:{id}`
- **Cache Invalidation**: Automatic cache updates on user modifications
- **Health Checks**: Redis connectivity verification

## 🔒 Configuration

Key configuration files:

### application.properties
```properties
# Server
server.port=3006

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/turborepo_dev
spring.datasource.username=developer
spring.datasource.password=dev123

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=redis123

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Docker Environment Variables
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/turborepo_dev
SPRING_DATASOURCE_USERNAME=developer
SPRING_DATASOURCE_PASSWORD=dev123
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=redis123
```

## 🧪 Testing

```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify

# Test health endpoint
curl http://localhost:3006/health

# Test user API
curl http://localhost:3006/api/users
```

## 📊 Monitoring

### Health Checks
The service provides comprehensive health monitoring:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-30T17:30:00",
  "service": "Turborepo Java API",
  "version": "0.1.0",
  "environment": "development",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "MySQL connection successful"
    },
    "redis": {
      "status": "healthy", 
      "message": "Redis connection successful"
    }
  }
}
```

### Actuator Endpoints
- `/actuator/health` - Health status
- `/actuator/info` - Application info
- `/actuator/metrics` - Application metrics

## 🚨 Troubleshooting

### Common Issues

1. **Port 3006 already in use**
   ```bash
   lsof -i :3006
   kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Check MySQL is running
   npm run db:up
   
   # Check connection
   mysql -h localhost -P 3306 -u developer -pdev123 turborepo_dev
   ```

3. **Redis connection failed**
   ```bash
   # Check Redis is running
   npm run redis:up
   
   # Test Redis connection
   npm run redis:cli
   ```

4. **Docker build issues**
   ```bash
   # Clean build
   docker system prune -f
   npm run java:build
   ```

## 🔗 Integration with Other Services

The Java API integrates seamlessly with other monorepo services:

- **Shares MySQL database** with Node.js API and PHP app
- **Uses same Redis instance** for caching and sessions
- **Compatible API format** with other backend services
- **Consistent user data model** across all platforms

## 📈 Performance

- **Connection Pooling**: Automatic database connection management
- **Redis Caching**: 24-hour user data caching
- **JVM Optimization**: Configured for container environments
- **Health Monitoring**: Proactive service monitoring

## 🎯 Next Steps

- [ ] Add JWT authentication
- [ ] Implement email verification
- [ ] Add comprehensive logging
- [ ] Create API documentation with Swagger
- [ ] Add integration tests
- [ ] Implement rate limiting
- [ ] Add metrics collection

---

**Java API is ready to serve! ☕🚀** 