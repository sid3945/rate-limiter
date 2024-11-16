let instance = null;
class RateLimter{
  constructor({window, maxHits, identifier='ip', customIdentifierExtractor=null}){
    if (instance) {
      return instance;
    }

    this.window = window;
    this.maxHits = maxHits;
    this.identifier = identifier;
    this.requests = new Map();
    this.customIdentifierExtractor = customIdentifierExtractor;

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
    return (req, res, next) => {
      const id = this.getIdentifier(req);
      const now = Date.now();

      if (!this.requests.has(id)) {
        this.requests.set(id, { count: 1, timestamp: now });
        setTimeout(() => this.requests.delete(id), this.window);
        return next();
      }

      const requestData = this.requests.get(id);

      if (now - requestData.timestamp > this.window) {
        requestData.count = 1;
        requestData.timestamp = now;
        return next();
      }

      requestData.count++;

      if (requestData.count > this.maxHits) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil((requestData.timestamp + this.window - now) / 1000),
        });
      }

      next();
    };
  }
}

export default RateLimter;