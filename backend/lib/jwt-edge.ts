
import * as jose from 'jose';

// Validate environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_UINT8 = new TextEncoder().encode(JWT_SECRET || 'fallback_secret_do_not_use_in_prod');

/**
 * JWT Payload interface
 */
export interface JWTPayload {
    userId: number;
    email: string;
    roles: string[];
    type: 'access' | 'refresh';
    sid?: string; // Session ID for concurrency tracking
    exp?: number;
}

/**
 * Verify JWT token (Edge Runtime Compatible)
 * Use this in Middleware
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
    try {
        if (!token) return null;

        const { payload } = await jose.jwtVerify(token, JWT_SECRET_UINT8, {
            issuer: 'durkkas-erp',
            audience: 'durkkas-api',
        });

        return payload as unknown as JWTPayload;
    } catch (error: any) {
        // console.error('JWT Edge verification error:', error.message);
        return null;
    }
}
