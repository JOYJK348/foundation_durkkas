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

api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.headers);
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
            // Optional: Redirect to login or clear auth
            console.warn('Unauthorized access - potential token expiry');
            // Cookies.remove('access_token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
