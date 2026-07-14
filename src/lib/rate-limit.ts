type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const stores: Map<string, RateLimitStore> = new Map();

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function rateLimit(namespace: string, config: RateLimitConfig) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
      if (!stores.has(namespace)) {
        stores.set(namespace, new Map());
      }

      const store = stores.get(namespace)!;
      const now = Date.now();
      const record = store.get(identifier);

      // Clean up expired entries periodically
      if (Math.random() < 0.01) {
        for (const [key, value] of store.entries()) {
          if (now > value.resetTime) {
            store.delete(key);
          }
        }
      }

      if (!record || now > record.resetTime) {
        // Create new record
        const resetTime = now + config.windowMs;
        store.set(identifier, { count: 1, resetTime });
        return { success: true, remaining: config.max - 1, resetTime };
      }

      if (record.count >= config.max) {
        // Rate limit exceeded
        return { success: false, remaining: 0, resetTime: record.resetTime };
      }

      // Increment count
      record.count++;
      store.set(identifier, record);
      return { success: true, remaining: config.max - record.count, resetTime: record.resetTime };
    },
  };
}
