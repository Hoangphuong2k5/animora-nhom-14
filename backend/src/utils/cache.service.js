import logger from './logger.js';

/**
 * Cache-Aside Service (Mục 14 clauden_node_js.md)
 * - Áp dụng Cache-Aside cho các tác vụ đọc nhiều (EXP-04, EXP-05, SVC-02).
 * - Việc xóa cache (Invalidation) KHÔNG BAO GIỜ gọi trực tiếp trong request thread của Core Service,
 *   mà được kích hoạt bất đồng bộ thông qua sự kiện Outbox Worker (consumeInvalidationEvent).
 */
class CacheService {
  constructor() {
    this.store = new Map();
  }

  async getOrSet(key, ttlSeconds, fetchCallback) {
    const now = Date.now();
    const cached = this.store.get(key);

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const freshValue = await fetchCallback();
    if (freshValue !== undefined && freshValue !== null) {
      this.store.set(key, {
        value: freshValue,
        expiresAt: now + ttlSeconds * 1000,
      });
    }
    return freshValue;
  }

  /**
   * Hỗ trợ phát tín hiệu invalidation hoặc xóa trực tiếp
   */
  emitInvalidation(prefixOrKey) {
    this.consumeInvalidationEvent(prefixOrKey);
  }

  /**
   * Chỉ được gọi bởi Background Outbox Worker (Event-Driven Cache Invalidation - Mục 14)
   */
  consumeInvalidationEvent(prefixOrKey) {
    let removedCount = 0;
    for (const key of this.store.keys()) {
      if (key === prefixOrKey || key.startsWith(prefixOrKey)) {
        this.store.delete(key);
        removedCount += 1;
      }
    }
    logger.debug('Async cache invalidation executed', {
      pattern: prefixOrKey,
      removedCount,
    });
  }
}

const cacheService = new CacheService();

export { cacheService, CacheService };
export default cacheService;
