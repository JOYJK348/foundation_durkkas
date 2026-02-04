import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
    // 1. Priority: Environment Variable (Must be set in Vercel)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Client-side handling
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Development / Local Network
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('10.') || hostname.startsWith('192.')) {
            return `http://${hostname}:3000/api`;
        }

        // Production fallback: Assuming API is on same domain or specific subdomain
        // For Vercel projects, you should ideally set NEXT_PUBLIC_API_URL
        return '/api';
    }

    // 3. Server-side fallback (Local)
    return 'http://127.0.0.1:3000/api';
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 🌐 Professional Public IP Detection with Location
let cachedClientIp: string | null = null;
let cachedLocation: string | null = null;
let ipDetectionComplete = false;

const detectClientIp = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (ipDetectionComplete && cachedClientIp) return;

    console.log('📡 [Identity] Detecting Public IP...');

    try {
        // Try multiple providers silently
        const providers = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://ipinfo.io/json?token=free' // Keeping as last resort
        ];

        for (const url of providers) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;

                const data = await res.json();
                const ip = data.ip || data.query; // handle different API formats

                if (ip) {
                    cachedClientIp = ip;
                    // Try to get location if available
                    const city = data.city || '';
                    const country = data.country || data.country_name || '';
                    cachedLocation = city && country ? `${city}, ${country}` : (country || '');

                    ipDetectionComplete = true;
                    console.log(`✅ [Identity] Verified IP: ${cachedClientIp}`);
                    return;
                }
            } catch (e) {
                // Silently try next provider
            }
        }
        console.warn('⚠️ [Identity] Primary IP verification failed, using server-side sensing.');
    } catch (err) {
        // Absolute silence for third party failures
    }
};

// Run detection on load
if (typeof window !== 'undefined') {
    detectClientIp();
}

api.interceptors.request.use((config) => {
    // 🔐 Authentication Token
    const token = Cookies.get('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log(`🔑 [API] Token attached to ${config.url} (Len: ${token.length})`);
    } else {
        console.warn('⚠️ [API] No access_token found in cookies for request:', config.url);
    }

    // 🏢 Multi-Tenant Context (CRITICAL for data isolation)
    const companyId = Cookies.get('x-company-id');
    const branchId = Cookies.get('x-branch-id');

    if (companyId) config.headers['x-company-id'] = companyId;
    if (branchId) config.headers['x-branch-id'] = branchId;

    // 🌐 Client IP Detection (for audit trail)
    if (cachedClientIp) {
        config.headers['x-durkkas-client-ip'] = cachedClientIp;
    }

    // 🔐 Device Fingerprinting (Persistent Hardware ID)
    if (typeof window !== 'undefined') {
        let fingerprint = localStorage.getItem('durkkas_fingerprint');
        if (!fingerprint) {
            fingerprint = `dk_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
            localStorage.setItem('durkkas_fingerprint', fingerprint);
        }
        config.headers['x-device-fingerprint'] = fingerprint;
    }

    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log(`[API RESPONSE] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('[API ERROR]', {
            target: API_URL,
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            const errorCode = error.response?.data?.error?.code;

            // Clear invalid session markers
            Cookies.remove('access_token', { path: '/' });

            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
                const errorCode = error.response?.data?.error?.code;

                // 🛑 AVOID REDIRECT LOOPS: Don't redirect if we're on a login page
                const isStudentLogin = currentPath === '/ems/student/login';
                const isMainLogin = currentPath === '/' || currentPath === '/login';

                if (isStudentLogin || isMainLogin) {
                    console.warn('⚠️ [API] 401 on login page - stopping redirect loop.');
                    return Promise.reject(error);
                }

                // Optional: Clear persisted store if token is invalid
                localStorage.removeItem('durkkas-auth-storage');

                const targetUrl = currentPath.startsWith('/ems/student')
                    ? `/ems/student/login?error=${errorCode || 'unauthorized'}`
                    : `/?error=${errorCode || 'unauthorized'}`;

                console.log(`🚀 [API] 401 redirecting from ${currentPath} to ${targetUrl}`);
                window.location.href = targetUrl;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
