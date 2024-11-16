class BaseStorage {
    async increment(key, window) {
      throw new Error('Must implement increment method');
    }
    
    async reset(key) {
      throw new Error('Must implement reset method');
    }
  }

  export default BaseStorage;