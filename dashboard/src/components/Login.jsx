import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/api';
import { Activity, Lock, User, Loader2 } from 'lucide-react';

import styles from '../styles/modules/Login.module.scss';

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useMutation({
        mutationFn: authApi.login,

        onSuccess: (data) => {
            if (data.success) {
                onLoginSuccess();
            } else {
                setError(data.message);
            }
        },

        onError: (error) => {
            setError(
                error.response?.data?.message ||
                'Failed to connect to server'
            );
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        loginMutation.mutate({
            username,
            password,
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.authWrapper}>

                {/* LEFT PANEL */}

                <div className={styles.leftPanel}>
                    <div className={styles.overlay} />

                    <div className={styles.leftContent}>
                        <div className={styles.brand}>
                            <Activity />
                            <span>ObserveX</span>
                        </div>

                        <div className={styles.hero}>
                            <h1>
                                Monitor APIs
                                <br />
                                With Confidence
                            </h1>

                            <p>
                                Real-time monitoring, analytics,
                                observability and alerting for
                                modern distributed systems.
                            </p>
                        </div>

                        <div className={styles.steps}>
                            <div
                                className={`${styles.step} ${styles.activeStep}`}
                            >
                                <span>1</span>
                                Connect Services
                            </div>

                            <div className={styles.step}>
                                <span>2</span>
                                Configure Monitoring
                            </div>

                            <div className={styles.step}>
                                <span>3</span>
                                Start Observing
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}

                <div className={styles.rightPanel}>
                    <div className={styles.loginCard}>
                        <div className={styles.cardHeader}>
                            <img
                                src="/Logo-Dark.png"
                                alt="ObserveX"
                                className={styles.logoImage}
                            />

                            <h1 className={styles.title}>
                                Welcome Back
                            </h1>

                            <p className={styles.description}>
                                Sign in to access your dashboard
                            </p>
                        </div>

                        <div className={styles.cardContent}>
                            {error && (
                                <div className={styles.errorMessage}>
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className={styles.form}
                            >
                                <div className={styles.inputGroup}>
                                    <label
                                        htmlFor="username"
                                        className={styles.label}
                                    >
                                        Username
                                    </label>

                                    <div className={styles.inputContainer}>
                                        <User />

                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your username"
                                            className={styles.input}
                                            disabled={
                                                loginMutation.isPending
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label
                                        htmlFor="password"
                                        className={styles.label}
                                    >
                                        Password
                                    </label>

                                    <div className={styles.inputContainer}>
                                        <Lock />

                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your password"
                                            className={styles.input}
                                            disabled={
                                                loginMutation.isPending
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={
                                        loginMutation.isPending
                                    }
                                >
                                    {loginMutation.isPending ? (
                                        <div className={styles.buttonContent}>
                                            <Loader2
                                                className={
                                                    styles.spinner
                                                }
                                            />
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;