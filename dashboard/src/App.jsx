import { useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

const OnboardSuperAdminPage = lazy(() => import('./pages/OnboardSuperAdminPage').then(m => ({ default: m.OnboardSuperAdminPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ClientDashboardPage = lazy(() => import('./pages/ClientDashboardPage').then(m => ({ default: m.ClientDashboardPage })));
const AnalyticsOverviewPage = lazy(() => import('./pages/AnalyticsOverviewPage').then(m => ({ default: m.AnalyticsOverviewPage })));
const EndpointAnalyticsPage = lazy(() => import('./pages/EndpointAnalyticsPage').then(m => ({ default: m.EndpointAnalyticsPage })));
const ClientsListPage = lazy(() => import('./pages/ClientsListPage').then(m => ({ default: m.ClientsListPage })));
const CreateClientPage = lazy(() => import('./pages/CreateClientPage').then(m => ({ default: m.CreateClientPage })));
const ClientDetailsPage = lazy(() => import('./pages/ClientDetailsPage').then(m => ({ default: m.ClientDetailsPage })));
const CreateClientUserPage = lazy(() => import('./pages/CreateClientUserPage').then(m => ({ default: m.CreateClientUserPage })));
const ApiKeysPage = lazy(() => import('./pages/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage').then(m => ({ default: m.DocumentationPage })));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogsPage').then(m => ({ default: m.ActivityLogsPage })));

const pageFallback = (
    <div style={{ height: '60vh', display: 'grid', placeItems: 'center' }}>Loading…</div>
);

function ProtectedRoute({ children, superAdminOnly }) {
    const { isSuperAdmin } = useAuth();
    if (superAdminOnly && !isSuperAdmin) {
        return <Navigate to="/client/dashboard" replace />;
    }
    return children;
}

function AuthenticatedRoutes({ onLogout }) {
    return (
        <DashboardLayout onLogout={onLogout}>
            <Suspense fallback={pageFallback}>
                <Routes>
                    <Route path="/" element={<Navigate to="/client/dashboard" replace />} />
                    <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                    <Route path="/analytics" element={<AnalyticsOverviewPage />} />
                    <Route path="/analytics/endpoints" element={<EndpointAnalyticsPage />} />
                    <Route path="/admin/clients" element={
                        <ProtectedRoute superAdminOnly><ClientsListPage /></ProtectedRoute>
                    } />
                    <Route path="/admin/clients/create" element={
                        <ProtectedRoute superAdminOnly><CreateClientPage /></ProtectedRoute>
                    } />
                    <Route path="/admin/clients/:id" element={<ClientDetailsPage />} />
                    <Route path="/admin/clients/:id/users/create" element={<CreateClientUserPage />} />
                    <Route path="/admin/clients/:id/api-keys" element={<ApiKeysPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/docs" element={<DocumentationPage />} />
                    <Route path="/activity" element={<ActivityLogsPage />} />
                    <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                </Routes>
            </Suspense>
        </DashboardLayout>
    );
}

function AuthGate() {
    const { isLoading, isAuthenticated, logout } = useAuth();
    const queryClient = useQueryClient();

    const handleLogout = useCallback(async () => {
        await logout();
        queryClient.clear();
    }, [logout, queryClient]);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
                Checking authentication…
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/onboard-super-admin" element={
                isAuthenticated ? <Navigate to="/client/dashboard" replace /> : (
                    <Suspense fallback={pageFallback}><OnboardSuperAdminPage /></Suspense>
                )
            } />
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/client/dashboard" replace /> : <Login />
            } />
            <Route path="/register" element={
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                    <ProtectedRoute superAdminOnly>
                        <Suspense fallback={pageFallback}><RegisterPage /></Suspense>
                    </ProtectedRoute>
                )
            } />
            <Route path="*" element={
                isAuthenticated ? <AuthenticatedRoutes onLogout={handleLogout} /> : <Login />
            } />
        </Routes>
    );
}

function AppWithProviders() {
    const queryClient = useQueryClient();

    return (
        <AuthProvider onUnauthorized={() => queryClient.clear()}>
            <AuthGate />
        </AuthProvider>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <AppWithProviders />
                    </BrowserRouter>
                </ToastProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
