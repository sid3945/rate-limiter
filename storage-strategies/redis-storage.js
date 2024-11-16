import BaseStorage from './base-storage.js';
import Redis from 'ioredis';

class RedisStorage extends BaseStorage {
  constructor(redisConfig) {
    super();
    this.redis = new Redis(redisConfig);
  }

  async increment(key, window) {
    const now = Date.now();
    const redisKey = `ratelimit:${key}`;

    // Check if key exists
    const exists = await this.redis.exists(redisKey);
    
    if (!exists) {
      // First request for this key
      await this.redis.hmset(redisKey, {
        count: 1,
        timestamp: now
      });
      await this.redis.pexpire(redisKey, window);
      return { count: 1, timestamp: now };
    }

    // Get existing data
    const data = await this.redis.hgetall(redisKey);
    const timestamp = parseInt(data.timestamp);
    
    // Check if window has expired
    if (now - timestamp > window) {
      // Reset counter for new window
      await this.redis.hmset(redisKey, {
        count: 1,
        timestamp: now
      });
      await this.redis.pexpire(redisKey, window);
      return { count: 1, timestamp: now };
    }

    // Increment counter within existing window
    const count = await this.redis.hincrby(redisKey, 'count', 1);
    return { count, timestamp };
  }

  async reset(key) {
    await this.redis.del(`ratelimit:${key}`);
  }
}

export default RedisStorage;