import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'observex_auth_token';

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isLoginOrOnboard = url.includes('/auth/login') || url.includes('/auth/onboard-super-admin');
        if (error.response?.status === 401 && !isLoginOrOnboard) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const token = response.data?.data?.token;
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    onboardSuperAdmin: async (userData) => {
        const response = await api.post('/auth/onboard-super-admin', userData);
        const token = response.data?.data?.token;
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async ({ token, password }) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },
    changePassword: async ({ currentPassword, newPassword }) => {
        const response = await api.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },
    getProfile: async (options) => {
        const response = await api.get('/auth/profile', { signal: options?.signal });
        return response.data;
    },
    logout: async () => {
        try {
            const response = await api.get('/auth/logout');
            return response.data;
        } finally {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    },
};

export const analyticsApi = {
    getDashboard: async (params) => {
        const response = await api.get('/analytics/dashboard', { params });
        const payload = response.data || {};

        payload.data = payload.data || {};

        payload.data.stats = payload.data.stats ?? {
            totalHits: 0,
            avgLatency: 0,
            errorRate: 0,
            errorHits: 0,
            successHits: 0,
            uniqueServices: 0,
            uniqueEndpoints: 0,
        };

        payload.data.topEndpoints = payload.data.topEndpoints ?? [];
        payload.data.recentActivity = payload.data.recentActitivy ?? payload.data.recentActivity ?? [];
        payload.data.services = payload.data.services ?? [];

        return payload;
    },
    getStats: async (params) => {
        const response = await api.get('/analytics/stats', { params });
        return response.data;
    },
};

export const clientApi = {
    onboardClient: async (clientData) => {
        const response = await api.post('/admin/clients/onboard', clientData);
        return response.data;
    },

    getClients: async () => {
        const response = await api.get('/admin/clients');
        return response.data;
    },

    getClient: async (clientId) => {
        const response = await api.get(
            `/admin/clients/${clientId}`
        );
    
        return response.data;
    },

    getClientUsers: async (clientId) => {
        const response = await api.get(
            `/admin/clients/${clientId}/users`
        );
    
        return response.data;
    },

    createClientUser: async (clientId, userData) => {
        const response = await api.post(
            `/admin/clients/${clientId}/users`,
            userData
        );

        return response.data;
    },

    createApiKey: async (clientId, keyData) => {
        const response = await api.post(
            `/admin/clients/${clientId}/api/keys`,
            keyData
        );

        return response.data;
    },

    getClientApiKeys: async (clientId) => {
        const response = await api.get(
            `/admin/clients/${clientId}/api/keys`
        );

        return response.data;
    },

    regenerateApiKey: async (clientId, keyId) => {
        const response = await api.post(
            `/admin/clients/${clientId}/api/keys/regenerate`,
            { keyId }
        );

        return response.data;
    },

    revokeApiKey: async (clientId, keyId) => {
        const response = await api.post(
            `/admin/clients/${clientId}/api/keys/revoke`,
            { keyId }
        );

        return response.data;
    },
};

export default api;
