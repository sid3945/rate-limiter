let instance;

import RedisStorage from "./storage-strategies/redis-storage.js";
import InMemoryStorage from "./storage-strategies/in-memory-storage.js";

class RateLimiter {
  constructor({
    window,
    maxHits,
    identifier = 'ip',
    customIdentifierExtractor = null,
    storage = 'memory',
    redisConfig = null
  }) {
    if (instance) {
      return instance;
    }

    this.window = window;
    this.maxHits = maxHits;
    this.identifier = identifier;
    this.customIdentifierExtractor = customIdentifierExtractor;

    // Initialize storage strategy
    if (storage === 'redis') {
      if (!redisConfig) {
        throw new Error('Redis configuration is required when using Redis storage');
      }
      this.storage = new RedisStorage(redisConfig);
    } else {
      this.storage = new InMemoryStorage();
    }

    instance = this;
  }

  getIdentifier(req) {
    if (this.customIdentifierExtractor) {
      return this.customIdentifierExtractor(req);
    }

    switch (this.identifier) {
      case 'ip':
        return req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      case 'authToken':
        return req.headers['authorization'] || '';
      case 'cookie':
        return req.cookies?.session || '';
      default:
        return '';
    }
  }

  guard() {
    return async (req, res, next) => {
      try {
        const id = this.getIdentifier(req);
        const requestData = await this.storage.increment(id, this.window);
        
        // Only check rate limit if we have valid request data
        if (requestData.count > this.maxHits) {
          const retryAfter = Math.ceil((requestData.timestamp + this.window - Date.now()) / 1000);
          return res.status(429).json({
            error: "Too many requests",
            retryAfter
          });
        }

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        // In case of storage errors, allow the request to proceed
        next();
      }
    };
  }
}

export default RateLimiter;