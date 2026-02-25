import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 500;

function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

/**
 * Simple in-memory cache for GET endpoints.
 * @param ttlSeconds Time-to-live in seconds (default 60)
 */
export function cacheResponse(ttlSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const entry = cache.get(key);

    if (entry && entry.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      res.json(entry.data);
      return;
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Evict if cache is full
        if (cache.size >= MAX_ENTRIES) evictExpired();
        if (cache.size >= MAX_ENTRIES) {
          // Delete oldest entry
          const firstKey = cache.keys().next().value;
          if (firstKey) cache.delete(firstKey);
        }
        cache.set(key, { data: body, expiresAt: Date.now() + ttlSeconds * 1000 });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

/** Clear cache entries matching a prefix (e.g. after mutations). */
export function invalidateCache(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
