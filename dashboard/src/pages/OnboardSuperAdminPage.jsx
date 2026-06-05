import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react';
import { authApi } from '../api/api';
import { AuthLayout, AuthCard } from '../components/auth/AuthLayout';
import { getPasswordStrength, isValidEmail, validatePassword } from '../lib/validation';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/Login.module.scss';

const ONBOARD_STEPS = [
    'Create Admin Account',
    'Secure Your Platform',
    'Start Observing',
];

export function OnboardSuperAdminPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const strength = getPasswordStrength(form.password);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                document.getElementById('onboard-form')?.requestSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const mutation = useMutation({
        mutationFn: () => authApi.onboardSuperAdmin({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
        }),
        onSuccess: (data) => {
            if (data.success) {
                setSuccess(true);
                toast('Super admin created successfully!', 'success');
                setTimeout(() => navigate('/login', { replace: true }), 2500);
            } else {
                toast(data.message || 'Onboarding failed', 'error');
            }
        },
        onError: (err) => {
            toast(err.response?.data?.message || 'Failed to create super admin', 'error');
        },
    });

    const validate = () => {
        const next = {};
        if (!form.username.trim()) next.username = 'Full name is required';
        if (!form.email.trim()) next.email = 'Email is required';
        else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
        const pwErr = validatePassword(form.password);
        if (pwErr) next.password = pwErr;
        if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) mutation.mutate();
    };

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    if (success) {
        return (
            <AuthLayout steps={ONBOARD_STEPS} activeStep={2} compact>
                <AuthCard title="You're All Set!" description="Your platform administrator account is ready">
                    <div className={styles.successState}>
                        <CheckCircle className={styles.successIcon} aria-hidden="true" />
                        <p>Redirecting you to sign in...</p>
                    </div>
                </AuthCard>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout steps={ONBOARD_STEPS} activeStep={0} compact>
            <AuthCard
                title="Create Super Admin"
                description="One-time setup for your platform administrator"
                footer={(
                    <p className={styles.footerText}>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.footerLink}>Sign in</Link>
                    </p>
                )}
            >
                <form id="onboard-form" onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.roleBadge}>
                        <Shield size={16} aria-hidden="true" />
                        <span>Super Administrator</span>
                        <em>Assigned automatically</em>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Full Name</label>
                        <div className={styles.inputContainer}>
                            <User aria-hidden="true" />
                            <input
                                id="username"
                                type="text"
                                value={form.username}
                                onChange={update('username')}
                                placeholder="Enter your full name"
                                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
                                autoComplete="name"
                            />
                        </div>
                        {errors.username && <p className={styles.fieldError} role="alert">{errors.username}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <div className={styles.inputContainer}>
                            <Mail aria-hidden="true" />
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={update('email')}
                                placeholder="you@company.com"
                                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && <p className={styles.fieldError} role="alert">{errors.email}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={update('password')}
                                placeholder="Create a strong password"
                                className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
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
                        {form.password && (
                            <div className={styles.strengthBar}>
                                <div
                                    className={`${styles.strengthFill} ${styles[`strength${strength.score}`]}`}
                                    style={{ width: `${strength.score * 25}%` }}
                                />
                            </div>
                        )}
                        {form.password && (
                            <p className={styles.strengthLabel}>Password strength: {strength.label}</p>
                        )}
                        {errors.password && <p className={styles.fieldError} role="alert">{errors.password}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={update('confirmPassword')}
                                placeholder="Re-enter your password"
                                className={`${styles.input} ${styles.inputWithToggle} ${errors.confirmPassword ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className={styles.eyeToggle}
                                onClick={() => setShowConfirm(!showConfirm)}
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className={styles.fieldError} role="alert">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <span className={styles.buttonContent}>
                                <Loader2 className={styles.spinner} aria-hidden="true" />
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                    <p className={styles.hint}>Press ⌘+Enter to submit</p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
