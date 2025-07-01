import Redis from 'ioredis';

class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'redis123',
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    this.client = new Redis(redisConfig);

    this.client.on('connect', () => {
      console.log('🔗 Redis connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  // 基础操作
  async set(key: string, value: string | object, ttl?: number): Promise<void> {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing JSON from Redis:', error);
      return null;
    }
  }

  async delete(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // TTL操作
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // 列表操作
  async listPush(key: string, ...values: string[]): Promise<number> {
    return await this.client.lpush(key, ...values);
  }

  async listPop(key: string): Promise<string | null> {
    return await this.client.lpop(key);
  }

  async listLength(key: string): Promise<number> {
    return await this.client.llen(key);
  }

  async listRange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  // 集合操作
  async setAdd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  async setMembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async setIsMember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  // 哈希操作
  async hashSet(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hashGet(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hashGetAll(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hashDelete(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  // 计数器
  async increment(key: string, delta: number = 1): Promise<number> {
    return await this.client.incrby(key, delta);
  }

  async decrement(key: string, delta: number = 1): Promise<number> {
    return await this.client.decrby(key, delta);
  }

  // 键操作
  async keys(pattern: string = '*'): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async flushAll(): Promise<string> {
    return await this.client.flushall();
  }

  // 连接管理
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  async info(): Promise<string> {
    return await this.client.info();
  }

  async quit(): Promise<string> {
    return await this.client.quit();
  }
}

export default RedisService;

// 创建并导出实例
export const redisService = RedisService.getInstance();

// 为了兼容性，直接导出常用方法
export const redis = {
  set: (key: string, value: string | object, ttl?: number) => redisService.set(key, value, ttl),
  get: (key: string) => redisService.get(key),
  setex: (key: string, ttl: number, value: string) => redisService.getClient().setex(key, ttl, value),
  del: (key: string) => redisService.delete(key),
  exists: (key: string) => redisService.exists(key),
  expire: (key: string, seconds: number) => redisService.expire(key, seconds),
  ping: () => redisService.ping()
}; 