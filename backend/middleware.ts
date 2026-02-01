import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/jwt-edge';
import { ALLOWED_ORIGINS } from './config/constants';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ENTERPRISE API MIDDLEWARE
 * Security Headers | Auth | CORS | Multi-Tenant Injection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Dynamic CORS Handling
    const origin = req.headers.get('origin') || '';

    // Check if origin matches allowed list, or is a Vercel preview/production domain
    const isAllowedOrigin =
        ALLOWED_ORIGINS.includes(origin) ||
        process.env.NODE_ENV === 'development' ||
        (!!origin && (origin.endsWith('.vercel.app') || origin.includes('vercel.app'))) ||
        (process.env.NEXT_PUBLIC_FRONTEND_URL && origin === process.env.NEXT_PUBLIC_FRONTEND_URL);

    // 2. Security Headers Helper
    const applySecurityHeaders = (response: NextResponse) => {
        // [RADAR] Log request for diagnostic purposes
        const ip = req.headers.get('x-forwarded-for') || 'local';
        console.log(`[CORS DEBUG] Method: ${req.method} | Path: ${pathname} | Origin: ${origin} | Allowed: ${isAllowedOrigin}`);

        // CORS Headers
        const allowedHeaders = [
            'Authorization',
            'Content-Type',
            'X-CSRF-Token',
            'X-Requested-With',
            'Accept',
            'Accept-Version',
            'Content-Length',
            'Content-MD5',
            'Date',
            'X-Api-Version',
            'Cache-Control',
            'Pragma',
            'x-durkkas-client-ip',
            'x-device-fingerprint',
            'x-company-id',
            'x-branch-id',
            'X-Durkkas-Client-IP',
            'X-Device-Fingerprint',
            'X-Company-Id',
            'X-Branch-Id'
        ].join(', ');

        if (process.env.NODE_ENV === 'development') {
            response.headers.set('Access-Control-Allow-Origin', origin || '*');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', allowedHeaders);
        } else if (isAllowedOrigin && origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', allowedHeaders);
            response.headers.set('Vary', 'Origin');
        }

        // Standard Security Headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if (process.env.NODE_ENV === 'production') {
            response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return response;
    };

    // 3. Handle OPTIONS request (CORS Preflight)
    if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        return applySecurityHeaders(response);
    }

    // 4. Skip auth for public routes
    const publicPaths = [
        '/api/auth/login',
        '/api/health',
        '/api/debug',
        '/api/crm/applications',
        '/api/crm/debug'
    ];

    if (publicPaths.some(path => pathname.startsWith(path))) {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
    }

    // 5. Auth Implementation
    // 5. Auth Implementation
    const authHeader = req.headers.get('authorization');

    // [DEEP INSPECTION] Log all auth-related headers to find if Browser is stripping them
    if (!authHeader) {
        const allHeaders: any = {};
        req.headers.forEach((v, k) => { allHeaders[k] = v; });
        console.error(`🚨 [AUTH] Authorization Header MISSING | Path: ${pathname} | Headers Received: ${JSON.stringify(allHeaders)}`);

        const response = NextResponse.json({
            success: false,
            error: { code: 'UNAUTHORIZED_MISSING_TOKEN', message: 'No authorization token provided' },
            timestamp: new Date().toISOString()
        }, { status: 401 });
        return applySecurityHeaders(response);
    }

    if (!authHeader.startsWith('Bearer ')) {
        console.error(`🚨 [AUTH] Malformed Header | Path: ${pathname} | Header: ${authHeader.substring(0, 15)}...`);
        const response = NextResponse.json({
            success: false,
            error: { code: 'UNAUTHORIZED_MALFORMED_TOKEN', message: 'Authorization header must start with Bearer' },
            timestamp: new Date().toISOString()
        }, { status: 401 });
        return applySecurityHeaders(response);
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = await verifyTokenEdge(token);
        if (!payload) {
            console.error(`🚨 [AUTH] Token Validation FAIL | Path: ${pathname} | Token: ${token.substring(0, 10)}...`);
            const response = NextResponse.json({
                success: false,
                error: { code: 'UNAUTHORIZED_INVALID_TOKEN', message: 'Invalid or expired token' },
                timestamp: new Date().toISOString()
            }, { status: 401 });
            return applySecurityHeaders(response);
        }

        console.log(`✅ [AUTH] Verified | User: ${payload.userId} | SID: ${payload.sid} | Path: ${pathname}`);

        // 6. Concurrency & Session Validation
        if (payload.sid) {
            try {
                const redisUrl = process.env.REDIS_URL;
                const redisToken = process.env.REDIS_TOKEN;

                if (!redisUrl || !redisToken) {
                    console.warn('⚠️ [SESSION] Redis credentials missing in Middleware environment');
                } else {
                    const checkKey = `user:${payload.userId}:sessions`;
                    const encodedKey = encodeURIComponent(checkKey);
                    const res = await fetch(`${redisUrl}/lrange/${encodedKey}/0/-1`, {
                        headers: { Authorization: `Bearer ${redisToken}` }
                    });

                    if (res.ok) {
                        const body = await res.json();
                        const activeSessions = body.result;
                        const isActive = Array.isArray(activeSessions) && activeSessions.includes(payload.sid);

                        if (!isActive) {
                            console.error(`🚨 [SESSION KICK] SID ${payload.sid} not in active list for User: ${payload.userId}`);
                            const response = NextResponse.json({
                                success: false,
                                error: { code: 'SESSION_EXPIRED', message: 'Session invalidated by newer login.' },
                                timestamp: new Date().toISOString()
                            }, { status: 401 });
                            return applySecurityHeaders(response);
                        }
                    } else {
                        console.error('❌ [SESSION] Redis fetch failed:', res.status);
                    }
                }
            } catch (redisErr: any) {
                console.error('❌ [SESSION ERROR] Redis Validation Failed:', redisErr.message);
            }
        }
        // 7. Request Context Injection
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', payload.userId.toString());
        requestHeaders.set('x-user-email', payload.email);
        requestHeaders.set('x-user-roles', JSON.stringify(payload.roles));

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        return applySecurityHeaders(response);

    } catch (err: any) {
        const response = NextResponse.json({
            success: false,
            error: {
                code: 'MIDDLEWARE_ERROR',
                message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
            },
            timestamp: new Date().toISOString()
        }, { status: 500 });
        return applySecurityHeaders(response);
    }
}

export const config = {
    matcher: '/api/:path*',
};
