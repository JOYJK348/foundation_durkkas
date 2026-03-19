/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GENERIC DATA CACHE - HIGH PERFORMANCE API RESPONSES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * PURPOSE: Cache complex API responses to achieve <100ms response times.
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    expiresAt: number;
}

class DataCache {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly DEFAULT_TTL = 60 * 1000; // 1 minute default
    private readonly MAX_ENTRIES = 500;

    /**
     * Get data from cache
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache
     */
    set(key: string, data: any, ttlMs: number = this.DEFAULT_TTL): void {
        if (this.cache.size >= this.MAX_ENTRIES) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttlMs
        });
    }

    /**
     * Invalidate specific key or pattern
     */
    invalidate(pattern: string): void {
        const keysToDelete: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(k => this.cache.delete(k));
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(k => this.cache.delete(k));
    }
}

export const dataCache = new DataCache();

// Periodic cleanup
setInterval(() => dataCache.cleanup(), 5 * 60 * 1000);
