// Advanced Caching Service
// Production-ready caching with TTL, invalidation, and performance monitoring

import { errorHandler } from './errorHandler';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
  metadata?: {
    size: number;
    compression?: boolean;
    source: string;
  };
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  compressionThreshold: number;
  enableMetrics: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  sets: number;
  size: number;
  hitRate: number;
  avgAccessTime: number;
}

class AdvancedCacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0,
    size: 0,
    hitRate: 0,
    avgAccessTime: 0
  };

  private accessTimes: number[] = [];
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 1000 * 60 * 30, // 30 minutes
      maxSize: 1000, // Maximum 1000 entries
      compressionThreshold: 1024 * 10, // 10KB
      enableMetrics: true,
      ...config
    };

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 5); // Clean every 5 minutes

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.destroy());
    }
  }

  // Get data from cache with performance tracking and error handling
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = performance.now();

    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.metrics.misses++;
        this.updateHitRate();
        return null;
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.metrics.misses++;
        this.metrics.evictions++;
        this.updateHitRate();
        return null;
      }

      // Update access metrics
      entry.hits++;
      entry.lastAccessed = Date.now();

      this.metrics.hits++;
      this.updateHitRate();

      const accessTime = performance.now() - startTime;
      this.accessTimes.push(accessTime);
      if (this.accessTimes.length > 100) {
        this.accessTimes.shift(); // Keep only last 100 measurements
      }
      this.updateAvgAccessTime();

      return entry.data;
    } catch (error) {
      await errorHandler.handleError(error as Error, {
        additionalData: { operation: 'cache.get', key }
      }, {
        severity: 'low',
        category: 'logic',
        handled: true
      });

      this.metrics.misses++;
      return null;
    }
  }

  // Set data in cache with advanced options and error handling
  async set<T = any>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      tags?: string[];
      metadata?: CacheEntry['metadata'];
    } = {}
  ): Promise<void> {
    try {
      const { ttl = this.config.defaultTTL, tags = [], metadata } = options;

      // Check cache size limit
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }

      // Calculate data size
      const dataSize = this.calculateDataSize(data);

      // Compress if needed
      let processedData: T = data;
      let compressed = false;

      if (dataSize > this.config.compressionThreshold && typeof data === 'string') {
        // Simple compression for large strings (in production, use proper compression)
        processedData = this.compressString(data) as T;
        compressed = true;
      }

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        lastAccessed: Date.now(),
        tags,
        metadata: {
          size: dataSize,
          compression: compressed,
          source: metadata?.source || 'application',
          ...metadata
        }
      };

      this.cache.set(key, entry);
      this.metrics.sets++;
      this.metrics.size = this.cache.size;

    } catch (error) {
      await errorHandler.handleError(error as Error, {
        additionalData: { operation: 'cache.set', key, dataSize: this.calculateDataSize(data) }
      }, {
        severity: 'medium',
        category: 'logic',
        handled: true
      });
    }
  }

  // Delete specific cache entry
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.size = this.cache.size;
    }
    return deleted;
  }

  // Clear cache by tags
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.metrics.size = this.cache.size;
    return invalidated;
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.cache.clear();
    this.metrics.size = 0;
    this.metrics.evictions += this.metrics.size;
  }

  // Get cache statistics
  getStats(): {
    entries: number;
    size: number;
    metrics: CacheMetrics;
    config: CacheConfig;
    topKeys: Array<{ key: string; hits: number; lastAccessed: number }>;
  } {
    const topKeys = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => b.hits - a.hits)
      .slice(0, 10)
      .map(([key, entry]) => ({
        key,
        hits: entry.hits,
        lastAccessed: entry.lastAccessed
      }));

    return {
      entries: this.cache.size,
      size: this.metrics.size,
      metrics: { ...this.metrics },
      config: { ...this.config },
      topKeys
    };
  }

  // Batch operations
  async getMultiple<T = any>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        if (value !== null) {
          results.set(key, value);
        }
      })
    );

    return results;
  }

  async setMultiple(entries: Array<{ key: string; data: any; options?: any }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, data, options }) => this.set(key, data, options))
    );
  }

  // Conditional caching with stale-while-revalidate pattern and graceful degradation
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
      tags?: string[];
      fallbackData?: T;
    } = {}
  ): Promise<T> {
    const { staleWhileRevalidate = false, fallbackData } = options;

    // Try to get from cache first with graceful degradation
    const cached = await errorHandler.withGracefulDegradation(
      () => this.get<T>(key),
      () => Promise.resolve(null),
      `cache.get(${key})`
    );

    if (cached !== null) {
      // If stale-while-revalidate is enabled, refresh in background
      if (staleWhileRevalidate) {
        setTimeout(async () => {
          try {
            const freshData = await fetcher();
            await this.set(key, freshData, options);
          } catch (error) {
            await errorHandler.handleError(error as Error, {
              additionalData: { operation: 'background_refresh', key }
            }, {
              severity: 'low',
              category: 'logic',
              handled: true
            });
          }
        }, 0);
      }

      return cached;
    }

    // Fetch fresh data with retry logic and fallback
    try {
      const data = await errorHandler.withRetry(fetcher, {
        maxRetries: 2,
        baseDelay: 500,
        retryCondition: (error) => {
          const message = error.message.toLowerCase();
          return message.includes('fetch') || message.includes('network') || message.includes('timeout');
        }
      });

      await this.set(key, data, options);
      return data;
    } catch (error) {
      // If fetch fails and we have fallback data, use it
      if (fallbackData !== undefined) {
        await errorHandler.handleError(error as Error, {
          additionalData: { operation: 'fetch_fallback', key, hasFallback: true }
        }, {
          severity: 'medium',
          category: 'network',
          handled: true
        });

        // Cache the fallback data with shorter TTL
        await this.set(key, fallbackData, { ...options, ttl: 1000 * 60 * 5 }); // 5 minutes
        return fallbackData;
      }

      // No fallback available, rethrow
      await errorHandler.handleError(error as Error, {
        additionalData: { operation: 'fetch_failed', key, hasFallback: false }
      }, {
        severity: 'high',
        category: 'network',
        handled: false
      });

      throw error;
    }
  }

  // Memory management
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let evicted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.metrics.evictions += evicted;
      this.metrics.size = this.cache.size;
    }
  }

  private calculateDataSize(data: any): number {
    try {
      // Rough estimation of data size in bytes
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }

  private compressString(data: string): string {
    // Simple compression - in production, use proper compression library
    // For now, just return as-is (compression would be implemented with proper library)
    return data;
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  private updateAvgAccessTime(): void {
    if (this.accessTimes.length > 0) {
      this.metrics.avgAccessTime = this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length;
    }
  }

  // Destroy cache service
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Create specialized cache instances for different data types
export const apiCache = new AdvancedCacheService({
  defaultTTL: 1000 * 60 * 15, // 15 minutes for API responses
  maxSize: 500,
  enableMetrics: true
});

export const marketDataCache = new AdvancedCacheService({
  defaultTTL: 1000 * 60 * 30, // 30 minutes for market data
  maxSize: 200,
  enableMetrics: true
});

export const propertyCache = new AdvancedCacheService({
  defaultTTL: 1000 * 60 * 60, // 1 hour for property data
  maxSize: 300,
  enableMetrics: true
});

export const aiResponseCache = new AdvancedCacheService({
  defaultTTL: 1000 * 60 * 60 * 24, // 24 hours for AI responses
  maxSize: 100,
  enableMetrics: true
});

// Main cache service instance
export const cacheService = new AdvancedCacheService();

// Export types
export type { CacheEntry, CacheConfig, CacheMetrics };