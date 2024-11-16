# Node.js Rate Limiter

A flexible and robust rate limiting middleware for Node.js applications with support for both in-memory and Redis-based storage. This rate limiter can be used in both single-server and distributed environments.

## Features

- 🚀 Simple and easy to use
- 💾 Multiple storage options (in-memory and Redis)
- 🔄 Configurable time windows and request limits
- 🎯 Multiple identifier strategies (IP, auth token, cookie)
- 🔌 Pluggable custom identifier extraction
- 🎨 Clean middleware interface
- 🔒 Thread-safe and distributed-safe (when using Redis)
- ⚡ Lightweight with minimal dependencies

## Configuration Options

### Basic Configuration

```javascript
const rateLimiter = new RateLimiter({
  window: 3000,       // Time window in milliseconds
  maxHits: 3,         // Maximum number of requests per window
  identifier: 'ip',   // Identifier strategy ('ip', 'authToken', 'cookie')
  storage: 'memory'   // Storage strategy ('memory' or 'redis')
});
```

### Redis Configuration

```javascript
const rateLimiter = new RateLimiter({
  window: 3000,
  maxHits: 3,
  storage: 'redis',
  redisConfig: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',  // if required
    db: 0                       // Redis database number
  }
});
```

### Custom Identifier

```javascript
const rateLimiter = new RateLimiter({
  window: 3000,
  maxHits: 3,
  customIdentifierExtractor: (req) => {
    return req.headers['x-custom-id'] || req.ip;
  }
});
```

## Storage Strategies

### In-Memory Storage
- Best for single-server deployments
- No additional dependencies
- Fast performance
- Data is lost on server restart

### Redis Storage
- Best for distributed environments
- Requires Redis server
- Consistent rate limiting across multiple servers
- Persists across server restarts
- Automatic cleanup of expired records

## Response Format

When rate limit is exceeded, the middleware returns:

```javascript
{
  error: "Too many requests",
  retryAfter: 3  // Seconds until the window resets
}
```

With HTTP status code 429 (Too Many Requests).

## Example Use Cases

### Basic API Rate Limiting

```javascript
const apiLimiter = new RateLimiter({
  window: 60000,    // 1 minute
  maxHits: 60       // 60 requests per minute
});

app.use('/api/', apiLimiter.guard());
```

### Different Limits for Authentication

```javascript
const publicLimiter = new RateLimiter({
  window: 60000,
  maxHits: 30
});

const authenticatedLimiter = new RateLimiter({
  window: 60000,
  maxHits: 100,
  identifier: 'authToken'
});

// Public endpoints
app.use('/api/public', publicLimiter.guard());

// Authenticated endpoints
app.use('/api/private', authenticatedLimiter.guard());
```

## Error Handling

The middleware includes built-in error handling:
- Redis connection failures fallback to allowing requests
- Invalid configurations throw errors during initialization
- All errors are logged for debugging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Todo
- [ ] Add support for sliding windows
- [ ] Add support for multiple concurrent windows
- [ ] Add support for rate limit headers
- [ ] Add support for custom response formats