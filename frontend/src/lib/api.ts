import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
    // 1. Check for manual override
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Client-side: Match the URL in the browser bar
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If we are on 10.11.x.x, talk to 10.11.x.x:3000
        return `http://${hostname}:3000/api`;
    }

    // 3. Fallback for server-side
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
