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
        // Primary: ipinfo.io (provides IP + location in one call)
        try {
            const res = await fetch('https://ipinfo.io/json?token=free');
            const data = await res.json();

            if (data.ip) {
                cachedClientIp = data.ip;
                // Format location: "Chennai, IN" or "City, Country"
                const city = data.city || '';
                const country = data.country || '';
                cachedLocation = city && country ? `${city}, ${country}` : (country || '');

                ipDetectionComplete = true;
                console.log(`✅ [Identity] IP: ${cachedClientIp} ${cachedLocation ? `(${cachedLocation})` : ''}`);
                return;
            }
        } catch (err) {
            console.warn('⚠️ [Identity] ipinfo.io failed, trying fallback...');
        }

        // Fallback: ipify (IP only, no location)
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();

            if (data.ip) {
                cachedClientIp = data.ip;
                ipDetectionComplete = true;
                console.log(`✅ [Identity] IP: ${cachedClientIp} (location unavailable)`);
                return;
            }
        } catch (err) {
            console.error('❌ [Identity] All IP detection methods failed');
        }

    } catch (err) {
        console.error('❌ [Identity] Critical error:', err);
    }
};

// Run detection on load
if (typeof window !== 'undefined') {
    detectClientIp();
}

api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject client-side detected IP for better audit accuracy (Local/VPN bypass)
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

            if (errorCode === 'SESSION_EXPIRED') {
                console.warn('⛔ Session invalidated by newer login. Forcing logout...');
                Cookies.remove('access_token', { path: '/' });
                Cookies.remove('refresh_token', { path: '/' });
                if (typeof window !== 'undefined') {
                    window.location.href = '/?error=session_invalidated';
                }
            } else {
                console.warn('Unauthorized access - potential token expiry');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
