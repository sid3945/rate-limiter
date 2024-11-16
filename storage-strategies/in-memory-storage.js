import BaseStorage from './base-storage.js';

class InMemoryStorage extends BaseStorage {
  constructor() {
    super();
    this.store = new Map();
  }

  async increment(key, window) {
    const now = Date.now();
    
    if (!this.store.has(key)) {
      this.store.set(key, { count: 1, timestamp: now });
      setTimeout(() => this.store.delete(key), window);
      return { count: 1, timestamp: now };
    }

    const data = this.store.get(key);
    
    if (now - data.timestamp > window) {
      data.count = 1;
      data.timestamp = now;
      return data;
    }

    data.count++;
    return data;
  }

  async reset(key) {
    this.store.delete(key);
  }
}

export default InMemoryStorage;