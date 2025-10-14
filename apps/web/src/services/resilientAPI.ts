/**
 * Resilient API wrapper with progressive enhancement and fallbacks
 * Provides offline-first capabilities and graceful degradation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResilientAPI {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch data with multiple fallback strategies
   */
  async fetchWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>,
    cacheKey: string,
    options: {
      cacheTTL?: number;
      enableOffline?: boolean;
    } = {}
  ): Promise<T> {
    const { cacheTTL = this.CACHE_TTL, enableOffline = true } = options;

    try {
      // Try primary source
      const result = await primary();

      // Cache successful result
      if (enableOffline) {
        this.setCache(cacheKey, result, cacheTTL);
      }

      return result;
    } catch (error) {
      console.warn(`Primary API failed for ${cacheKey}:`, error);

      // Try cache first
      if (enableOffline) {
        const cached = this.getCache<T>(cacheKey);
        if (cached) {
          console.log(`Using cached data for ${cacheKey}`);
          return cached;
        }
      }

      // Use fallback
      console.log(`Using fallback data for ${cacheKey}`);
      const fallbackResult = await fallback();
      return fallbackResult;
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache for specific key or all
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const resilientAPI = new ResilientAPI();

// Utility functions for common data patterns
export const getMockTownData = () => [
  { name: 'Tamarindo', count: 67, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { name: 'Nosara', count: 45, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Flamingo', count: 38, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { name: 'Playa Grande', count: 29, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { name: 'Potrero', count: 52, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { name: 'Samara', count: 41, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' }
];

export const getMockPropertyData = () => [
  {
    id: 'mock-1',
    title: 'Luxury Oceanfront Villa',
    location: 'Tamarindo, Guanacaste',
    price: 1250000,
    beds: 4,
    baths: 3,
    sqft: 320,
    lot: 1200,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    featured: true,
    verified: true,
    new: false,
    tags: ['Ocean View', 'Pool', 'Garden']
  },
  {
    id: 'mock-2',
    title: 'Modern Beach Condo',
    location: 'Playa Flamingo, Guanacaste',
    price: 450000,
    beds: 2,
    baths: 2,
    sqft: 180,
    lot: null,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    featured: false,
    verified: true,
    new: true,
    tags: ['Beachfront', 'Resort', 'Furnished']
  }
];