/**
 * Redis Client Configuration (Upstash)
 * 
 * This file provides a Redis client for caching and session management.
 * Uses Upstash Redis for serverless-compatible caching.
 */

import { Redis } from '@upstash/redis';

// Validate environment variables
if (!process.env.REDIS_URL) {
    throw new Error('Missing REDIS_URL environment variable');
}

if (!process.env.REDIS_TOKEN) {
    throw new Error('Missing REDIS_TOKEN environment variable');
}

/**
 * Upstash Redis client
 * Serverless-compatible, no connection pooling needed
 */
export const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

/**
 * Cache keys prefix for organization
 */
export const CACHE_KEYS = {
    USER_SESSION: (userId: number) => `session:user:${userId}`,
    USER_PERMISSIONS: (userId: number) => `permissions:user:${userId}`,
    USER_ROLES: (userId: number) => `roles:user:${userId}`,
    USER_MENUS: (userId: number) => `menus:user:${userId}`,
    BRANCHES_ALL: 'branches:all',
    DEPARTMENTS_ALL: 'departments:all',
    DESIGNATIONS_ALL: 'designations:all',
    RATE_LIMIT: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
    SESSION: 7 * 24 * 60 * 60, // 7 days
    PERMISSIONS: 60 * 60, // 1 hour
    ROLES: 60 * 60, // 1 hour
    MENUS: 60 * 60, // 1 hour
    MASTER_DATA: 2 * 60 * 60, // 2 hours
    RATE_LIMIT: 15 * 60, // 15 minutes
} as const;

/**
 * Cache user session
 * 
 * @param userId - User ID
 * @param sessionData - Session data to cache
 * @param ttl - Time to live in seconds (default: 7 days)
 */
export async function cacheUserSession(
    userId: number,
    sessionData: any,
    ttl: number = CACHE_TTL.SESSION
): Promise<void> {
    await redis.setex(
        CACHE_KEYS.USER_SESSION(userId),
        ttl,
        JSON.stringify(sessionData)
    );
}

/**
 * Get cached user session
 * 
 * @param userId - User ID
 * @returns Session data or null if not found
 */
export async function getCachedUserSession(userId: number): Promise<any | null> {
    const data = await redis.get(CACHE_KEYS.USER_SESSION(userId));
    return data ? JSON.parse(data as string) : null;
}

/**
 * Delete user session cache
 * 
 * @param userId - User ID
 */
export async function deleteCachedUserSession(userId: number): Promise<void> {
    await redis.del(CACHE_KEYS.USER_SESSION(userId));
}

/**
 * Cache user permissions
 * 
 * @param userId - User ID
 * @param permissions - Array of permission strings
 * @param ttl - Time to live in seconds (default: 1 hour)
 */
export async function cacheUserPermissions(
    userId: number,
    permissions: string[],
    ttl: number = CACHE_TTL.PERMISSIONS
): Promise<void> {
    await redis.setex(
        CACHE_KEYS.USER_PERMISSIONS(userId),
        ttl,
        JSON.stringify(permissions)
    );
}

/**
 * Get cached user permissions
 * 
 * @param userId - User ID
 * @returns Array of permission strings or null if not found
 */
export async function getCachedUserPermissions(userId: number): Promise<string[] | null> {
    const data = await redis.get(CACHE_KEYS.USER_PERMISSIONS(userId));
    return data ? JSON.parse(data as string) : null;
}

/**
 * Delete user permissions cache
 * 
 * @param userId - User ID
 */
export async function deleteCachedUserPermissions(userId: number): Promise<void> {
    await redis.del(CACHE_KEYS.USER_PERMISSIONS(userId));
}

/**
 * Cache generic data
 * 
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in seconds
 */
export async function cacheData(
    key: string,
    data: any,
    ttl: number
): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(data));
}

/**
 * Get cached data
 * 
 * @param key - Cache key
 * @returns Cached data or null if not found
 */
export async function getCachedData<T = any>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
}

/**
 * Delete cached data
 * 
 * @param key - Cache key
 */
export async function deleteCachedData(key: string): Promise<void> {
    await redis.del(key);
}

/**
 * Invalidate all user-related caches
 * 
 * @param userId - User ID
 */
export async function invalidateUserCaches(userId: number): Promise<void> {
    await Promise.all([
        deleteCachedUserSession(userId),
        deleteCachedUserPermissions(userId),
        redis.del(CACHE_KEYS.USER_ROLES(userId)),
        redis.del(CACHE_KEYS.USER_MENUS(userId)),
    ]);
}

/**
 * Rate limiting check
 * 
 * @param ip - Client IP address
 * @param endpoint - API endpoint
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export async function checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<boolean> {
    const key = CACHE_KEYS.RATE_LIMIT(ip, endpoint);
    const current = await redis.incr(key);

    if (current === 1) {
        await redis.expire(key, Math.floor(windowMs / 1000));
    }

    return current > maxRequests;
}
