import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/api';
import { AuthLayout, AuthCard } from '../components/auth/AuthLayout';
import { getPasswordStrength, isValidEmail, validatePassword } from '../lib/validation';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/Login.module.scss';

const REGISTER_STEPS = [
    'User Details',
    'Assign Role',
    'Complete Setup',
];

const ROLE_OPTIONS = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full platform access' },
    { value: 'client_admin', label: 'Client Admin', description: 'Manage client org & users' },
    { value: 'client_viewer', label: 'Client Viewer', description: 'View analytics only' },
];

export function RegisterPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'client_viewer',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const strength = getPasswordStrength(form.password);
    const selectedRole = ROLE_OPTIONS.find((r) => r.value === form.role);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                document.getElementById('register-form')?.requestSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const mutation = useMutation({
        mutationFn: () => authApi.register({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
        }),
        onSuccess: (data) => {
            if (data.success) {
                setSuccess(true);
                toast('User registered successfully', 'success');
                setTimeout(() => navigate('/client/dashboard', { replace: true }), 2000);
            } else {
                toast(data.message || 'Registration failed', 'error');
            }
        },
        onError: (err) => {
            toast(err.response?.data?.message || 'Failed to register user', 'error');
        },
    });

    const validate = () => {
        const next = {};
        if (!form.username.trim()) next.username = 'Full name is required';
        if (!form.email.trim()) next.email = 'Email is required';
        else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
        const pwErr = validatePassword(form.password);
        if (pwErr) next.password = pwErr;
        if (!form.confirmPassword) next.confirmPassword = 'Please confirm the password';
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
            <AuthLayout steps={REGISTER_STEPS} activeStep={2} compact>
                <AuthCard title="User Created" description="The new account has been registered">
                    <div className={styles.successState}>
                        <CheckCircle className={styles.successIcon} aria-hidden="true" />
                        <p>Returning to dashboard...</p>
                    </div>
                </AuthCard>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout steps={REGISTER_STEPS} activeStep={1} compact>
            <AuthCard
                title="Register User"
                description="Create a new platform user account"
                footer={(
                    <p className={styles.footerText}>
                        <Link to="/client/dashboard" className={styles.footerLink}>← Back to dashboard</Link>
                    </p>
                )}
            >
                <form id="register-form" onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-username" className={styles.label}>Full Name</label>
                        <div className={styles.inputContainer}>
                            <User aria-hidden="true" />
                            <input
                                id="reg-username"
                                type="text"
                                value={form.username}
                                onChange={update('username')}
                                placeholder="Enter full name"
                                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
                            />
                        </div>
                        {errors.username && <p className={styles.fieldError} role="alert">{errors.username}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-email" className={styles.label}>Email</label>
                        <div className={styles.inputContainer}>
                            <Mail aria-hidden="true" />
                            <input
                                id="reg-email"
                                type="email"
                                value={form.email}
                                onChange={update('email')}
                                placeholder="user@company.com"
                                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
                            />
                        </div>
                        {errors.email && <p className={styles.fieldError} role="alert">{errors.email}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-role" className={styles.label}>Role</label>
                        <div className={styles.inputContainer}>
                            <ShieldCheck aria-hidden="true" />
                            <select
                                id="reg-role"
                                value={form.role}
                                onChange={update('role')}
                                className={styles.select}
                                disabled={mutation.isPending}
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {selectedRole && (
                            <p className={styles.roleHint}>{selectedRole.description}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-password" className={styles.label}>Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={update('password')}
                                placeholder="Create a password"
                                className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
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
                        {errors.password && <p className={styles.fieldError} role="alert">{errors.password}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-confirm" className={styles.label}>Confirm Password</label>
                        <div className={styles.inputContainer}>
                            <Lock aria-hidden="true" />
                            <input
                                id="reg-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={update('confirmPassword')}
                                placeholder="Re-enter password"
                                className={`${styles.input} ${styles.inputWithToggle} ${errors.confirmPassword ? styles.inputError : ''}`}
                                disabled={mutation.isPending}
                                required
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
                                Registering...
                            </span>
                        ) : 'Register User'}
                    </button>
                    <p className={styles.hint}>Press ⌘+Enter to submit</p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
