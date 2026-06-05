import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthLayout, AuthCard } from './auth/AuthLayout';
import styles from '../styles/modules/Login.module.scss';

const LOGIN_STEPS = ['Connect Services', 'Configure Monitoring', 'Start Observing'];

const REMEMBER_KEY = 'observex_remember_username';

function Login() {
    const { login } = useAuth();
    const toast = useToast();
    const [username, setUsername] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(!!localStorage.getItem(REMEMBER_KEY));
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                document.getElementById('login-form')?.requestSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        loginMutation.mutate();
    };

    const recentLogin = localStorage.getItem(REMEMBER_KEY);

    return (
        <AuthLayout steps={LOGIN_STEPS} activeStep={0}>
            <AuthCard
                title="Welcome Back"
                description="Sign in to access your dashboard"
                footer={(
                    <p className={styles.footerText}>
                        First time?{' '}
                        <Link to="/onboard-super-admin" className={styles.footerLink}>
                            Set up super admin
                        </Link>
                    </p>
                )}
            >
                {recentLogin && (
                    <p className={styles.recentLogin}>Recent: {recentLogin}</p>
                )}
                {error && <div className={styles.errorMessage} role="alert">{error}</div>}
                <form id="login-form" onSubmit={handleSubmit} className={styles.form}>
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
                                onClick={() => toast('Contact your administrator to reset your password', 'info')}
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
