import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, User, Mail, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authApi } from '../api/api';
import { AuthLayout, AuthCard } from './auth/AuthLayout';
import styles from '../styles/modules/Login.module.scss';
import MetaTags from './MetaTags';

const LOGIN_STEPS = ['Connect Services', 'Configure Monitoring', 'Start Observing'];
const REMEMBER_KEY = 'observex_remember_username';

function Login() {
    const { login } = useAuth();
    const toast = useToast();

    // Mode: 'login' | 'forgot'
    const [view, setView] = useState('login');

    // Login state
    const [username, setUsername] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(!!localStorage.getItem(REMEMBER_KEY));
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);

    // Shared feedback
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (view === 'login') {
                    document.getElementById('login-form')?.requestSubmit();
                } else {
                    document.getElementById('forgot-form')?.requestSubmit();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [view]);

    const loginMutation = useMutation({
        mutationFn: () => login({ username, password }),
        onSuccess: (data) => {
            if (data.success) {
                if (rememberMe) localStorage.setItem(REMEMBER_KEY, username);
                else localStorage.removeItem(REMEMBER_KEY);
                toast('Welcome back!', 'success');
            } else {
                setError(data.message);
            }
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Failed to connect to server');
        },
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setError('');
        loginMutation.mutate();
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setForgotLoading(true);

        try {
            const data = await authApi.forgotPassword(forgotEmail.trim());
            setForgotSuccess(true);
            const msg = data?.message || 'If an account with that email address exists, password reset instructions have been sent.';
            setSuccessMsg(msg);
            toast('Password reset instructions sent!', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    };

    const switchToForgot = () => {
        setView('forgot');
        setError('');
        setSuccessMsg('');
        setForgotSuccess(false);
    };

    const switchToLogin = () => {
        setView('login');
        setError('');
        setSuccessMsg('');
        setForgotSuccess(false);
    };

    const recentLogin = localStorage.getItem(REMEMBER_KEY);

    if (view === 'forgot') {
        return (
            <AuthLayout steps={LOGIN_STEPS} activeStep={0}>
                <MetaTags
                    title="Reset Password - ObserveX"
                    description="Request a password reset link for your ObserveX account."
                    canonical="/login"
                    robots="noindex, nofollow"
                />
                <AuthCard
                    title="Reset Password"
                    description="Enter your email to receive password reset instructions"
                    footer={(
                        <p className={styles.footerText}>
                            Remembered your password?{' '}
                            <button
                                type="button"
                                onClick={switchToLogin}
                                className={styles.footerLink}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                Back to sign in
                            </button>
                        </p>
                    )}
                >
                    {error && <div className={styles.errorMessage} role="alert">{error}</div>}
                    {successMsg && <div className={styles.successMessage} role="status">{successMsg}</div>}

                    {forgotSuccess ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.6', margin: 0 }}>
                                Check your email inbox for a message from ObserveX with a secure password reset link. The link is valid for 60 minutes.
                            </p>
                            <button
                                type="button"
                                onClick={switchToLogin}
                                className={styles.submitButton}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </button>
                        </div>
                    ) : (
                        <form id="forgot-form" onSubmit={handleForgotSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="forgot-email" className={styles.label}>Email Address</label>
                                <div className={styles.inputContainer}>
                                    <Mail aria-hidden="true" />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className={styles.input}
                                        disabled={forgotLoading}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.submitButton} disabled={forgotLoading}>
                                {forgotLoading ? (
                                    <span className={styles.buttonContent}>
                                        <Loader2 className={styles.spinner} aria-hidden="true" />
                                        Sending Instructions...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                            <p className={styles.hint}>Press ⌘+Enter to submit</p>
                        </form>
                    )}
                </AuthCard>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout steps={LOGIN_STEPS} activeStep={0}>
            <MetaTags
                title="Sign In - ObserveX"
                description="Sign in to your ObserveX account to access your real-time API monitoring dashboard, endpoints, and telemetry logs."
                keywords="login, sign in, observex portal, api monitoring dashboard, secure access"
                canonical="/login"
                robots="noindex, nofollow"
            />
            <AuthCard
                title="Welcome Back"
                description="Sign in to access your dashboard"
                footer={(
                    <p className={styles.footerText}>
                        First time?{' '}
                        <Link to="/onboard-super-admin" className={styles.footerLink}>
                            Create super admin account
                        </Link>
                    </p>
                )}
            >
                {recentLogin && (
                    <p className={styles.recentLogin}>Recent: {recentLogin}</p>
                )}
                {error && <div className={styles.errorMessage} role="alert">{error}</div>}
                <form id="login-form" onSubmit={handleLoginSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <div className={styles.inputContainer}>
                            <User aria-hidden="true" />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className={styles.input}
                                disabled={loginMutation.isPending}
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <button
                                type="button"
                                className={styles.forgotLink}
                                onClick={switchToForgot}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={`${styles.input} ${styles.inputWithToggle}`}
                                disabled={loginMutation.isPending}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.eyeToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <label className={styles.rememberRow}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Remember me
                    </label>
                    <button type="submit" className={styles.submitButton} disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                            <span className={styles.buttonContent}>
                                <Loader2 className={styles.spinner} aria-hidden="true" />
                                Signing In...
                            </span>
                        ) : 'Sign In'}
                    </button>
                    <p className={styles.hint}>Press ⌘+Enter to sign in</p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}

export default Login;
