import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authApi } from '../api/api';
import { useToast } from '../contexts/ToastContext';
import { AuthLayout, AuthCard } from '../components/auth/AuthLayout';
import styles from '../styles/modules/Login.module.scss';
import MetaTags from '../components/MetaTags';

const RESET_STEPS = ['Request Reset', 'Verify Token', 'New Password'];

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();
    const toast = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Missing password reset token. Please request a new link.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const data = await authApi.resetPassword({ token, password });
            setSuccess(true);
            toast('Password reset successfully! Please sign in.', 'success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout steps={RESET_STEPS} activeStep={1}>
                <MetaTags
                    title="Invalid Reset Link - ObserveX"
                    description="Password reset link error."
                    robots="noindex, nofollow"
                />
                <AuthCard
                    title="Invalid Reset Link"
                    description="The password reset link is invalid or incomplete."
                    footer={(
                        <p className={styles.footerText}>
                            <Link to="/login" className={styles.footerLink}>
                                Back to sign in
                            </Link>
                        </p>
                    )}
                >
                    <div className={styles.errorMessage}>
                        No reset token was found in the link. Please request a new password reset link from the sign in page.
                    </div>
                    <Link
                        to="/login"
                        className={styles.submitButton}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    >
                        Return to Sign In
                    </Link>
                </AuthCard>
            </AuthLayout>
        );
    }

    if (success) {
        return (
            <AuthLayout steps={RESET_STEPS} activeStep={2}>
                <MetaTags
                    title="Password Reset Successful - ObserveX"
                    description="Your ObserveX password has been updated."
                    robots="noindex, nofollow"
                />
                <AuthCard
                    title="Password Updated"
                    description="Your password has been successfully reset"
                    footer={(
                        <p className={styles.footerText}>
                            <Link to="/login" className={styles.footerLink}>
                                Sign in now
                            </Link>
                        </p>
                    )}
                >
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                        <p style={{ color: '#F3F4F6', fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0' }}>
                            You are all set!
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 24px 0' }}>
                            Redirecting to sign in page in a few seconds...
                        </p>
                        <Link
                            to="/login"
                            className={styles.submitButton}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                        >
                            Sign In With New Password
                        </Link>
                    </div>
                </AuthCard>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout steps={RESET_STEPS} activeStep={2}>
            <MetaTags
                title="Set New Password - ObserveX"
                description="Set a new password for your ObserveX account."
                canonical="/reset-password"
                robots="noindex, nofollow"
            />
            <AuthCard
                title="Set New Password"
                description="Enter a new secure password for your account"
                footer={(
                    <p className={styles.footerText}>
                        Remember your password?{' '}
                        <Link to="/login" className={styles.footerLink}>
                            Back to sign in
                        </Link>
                    </p>
                )}
            >
                {error && <div className={styles.errorMessage} role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="new-password" className={styles.label}>New Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="new-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter at least 8 characters"
                                className={`${styles.input} ${styles.inputWithToggle}`}
                                disabled={loading}
                                required
                                minLength={8}
                                autoComplete="new-password"
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirm-password" className={styles.label}>Confirm New Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                className={styles.input}
                                disabled={loading}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? (
                            <span className={styles.buttonContent}>
                                <Loader2 className={styles.spinner} aria-hidden="true" />
                                Updating Password...
                            </span>
                        ) : 'Update Password'}
                    </button>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}

export default ResetPasswordPage;
