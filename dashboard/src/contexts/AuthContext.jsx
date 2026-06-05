import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, onUnauthorized }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (signal) => {
        const response = await authApi.getProfile({ signal });
        setUser(response.data);
        return response.data;
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchProfile(controller.signal)
            .catch((err) => {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    setUser(null);
                }
            })
            .finally(() => setIsLoading(false));
        return () => controller.abort();
    }, [fetchProfile]);

    useEffect(() => {
        const handle401 = () => {
            setUser(null);
            onUnauthorized?.();
        };
        window.addEventListener('auth:unauthorized', handle401);
        return () => window.removeEventListener('auth:unauthorized', handle401);
    }, [onUnauthorized]);

    const login = useCallback(async (credentials) => {
        const response = await authApi.login(credentials);
        if (response.success) {
            await fetchProfile();
        }
        return response;
    }, [fetchProfile]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // proceed with local logout
        }
        setUser(null);
        onUnauthorized?.();
    }, [onUnauthorized]);

    const refreshProfile = useCallback(() => fetchProfile(), [fetchProfile]);

    const value = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'super_admin',
        isClientAdmin: user?.role === 'client_admin',
        isClientViewer: user?.role === 'client_viewer',
        clientId: user?.clientId,
        login,
        logout,
        refreshProfile,
        setUser,
    }), [user, isLoading, login, logout, refreshProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
