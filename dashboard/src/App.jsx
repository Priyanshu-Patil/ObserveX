import { useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout, PageTransition, NavigationProgressBar } from './components/layout';
import { PageFallback } from './components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { PwaProvider } from './contexts/PwaContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import PwaInstallBanner from './components/pwa/PwaInstallBanner';
import OfflineIndicator from './components/pwa/OfflineIndicator';


import LandingPage from './pages/LandingPage';
const OnboardSuperAdminPage = lazy(() => import('./pages/OnboardSuperAdminPage').then(m => ({ default: m.OnboardSuperAdminPage })));
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
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const PublicDocsPage = lazy(() => import('./pages/PublicDocsPage').then(m => ({ default: m.PublicDocsPage })));

function ProtectedRoute({ children, superAdminOnly }) {
    const { isSuperAdmin } = useAuth();
    if (superAdminOnly && !isSuperAdmin) {
        return <Navigate to="/client/dashboard" replace />;
    }
    return children;
}

function AuthenticatedRoutes({ onLogout }) {
    const location = useLocation();
    return (
        <DashboardLayout onLogout={onLogout}>
            <Suspense fallback={<PageFallback message="Loading view..." subtitle="Preparing dashboard analytics" />}>
                <PageTransition pageKey={location.pathname}>
                    <Routes location={location}>
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
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                </PageTransition>
            </Suspense>
        </DashboardLayout>
    );
}

function AuthGate() {
    const { isLoading, isAuthenticated, logout } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(async () => {
        await logout();
        queryClient.clear();
        navigate('/', { replace: true });
    }, [logout, queryClient, navigate]);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
                <PageFallback message="Checking authentication..." subtitle="Verifying session credentials" />
            </div>
        );
    }

    // Keep authenticated dashboard inside a single key so sidebar/header don't re-animate when changing inner tabs
    const isDashboardPath = isAuthenticated && (
        location.pathname.startsWith('/client') ||
        location.pathname.startsWith('/analytics') ||
        location.pathname.startsWith('/admin') ||
        location.pathname === '/settings' ||
        location.pathname === '/activity' ||
        (location.pathname === '/docs' && isAuthenticated)
    );
    const authGateKey = isDashboardPath ? 'dashboard-shell' : location.pathname;

    return (
        <Suspense fallback={<PageFallback />}>
            <PageTransition pageKey={authGateKey}>
                <Routes location={location}>
            
                    {/* LANDING PAGE */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/client/dashboard"
                                    replace
                                />
                            ) : (
                                <LandingPage />
                            )
                        }
                    />
            
                    {/* PRIVACY POLICY */}
                    <Route
                        path="/privacy"
                        element={<PrivacyPage />}
                    />

                    {/* TERMS OF SERVICE */}
                    <Route
                        path="/terms"
                        element={<TermsPage />}
                    />

                    {/* ABOUT */}
                    <Route
                        path="/about"
                        element={<AboutPage />}
                    />

                    {/* DOCUMENTATION (PUBLIC) */}
                    {!isAuthenticated && (
                        <Route
                            path="/docs"
                            element={<PublicDocsPage />}
                        />
                    )}


                    {/* SUPER ADMIN SETUP */}
                    <Route
                        path="/onboard-super-admin"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/client/dashboard"
                                    replace
                                />
                            ) : (
                                <OnboardSuperAdminPage />
                            )
                        }
                    />
            
                    {/* LOGIN */}
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/client/dashboard"
                                    replace
                                />
                            ) : (
                                <Login />
                            )
                        }
                    />

                    {/* RESET PASSWORD */}
                    <Route
                        path="/reset-password"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/client/dashboard"
                                    replace
                                />
                            ) : (
                                <ResetPasswordPage />
                            )
                        }
                    />
            
                    {/* 404 NOT FOUND */}
                    <Route
                        path="/404"
                        element={<NotFoundPage />}
                    />

                    {/* AUTHENTICATED APP OR 404 FALLBACK */}
                    <Route
                        path="*"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoutes
                                    onLogout={handleLogout}
                                />
                            ) : (
                                <NotFoundPage />
                            )
                        }
                    />
                </Routes>
            </PageTransition>
        </Suspense>
    );
}

function AppWithProviders() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        <AuthProvider onUnauthorized={() => {
            queryClient.clear();
            navigate('/', { replace: true });
        }}>
            <AuthGate />
        </AuthProvider>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <PwaProvider>
                    <ToastProvider>
                        <BrowserRouter>
                            <NavigationProgressBar />
                            <ScrollToTop />
                            <OfflineIndicator />
                            <AppWithProviders />
                            <PwaInstallBanner />
                        </BrowserRouter>
                    </ToastProvider>
                </PwaProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
