import { useEffect } from 'react';
import { Activity } from 'lucide-react';
import styles from '../../styles/modules/Login.module.scss';

export function AuthLayout({ steps, activeStep = 0, compact = false, children }) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={`${styles.authWrapper} ${compact ? styles.compact : ''}`}>
                <div className={styles.leftPanel}>
                    <div className={styles.overlay} />
                    <div className={styles.leftContent}>
                        <div className={styles.brand}>
                            <Activity aria-hidden="true" />
                            <span>ObserveX</span>
                        </div>
                        <div className={styles.hero}>
                            <h1>Monitor APIs<br />With Confidence</h1>
                            <p>
                                Real-time monitoring, analytics, observability and alerting
                                for modern distributed systems.
                            </p>
                        </div>
                        {steps?.length > 0 && (
                            <div className={styles.steps}>
                                {steps.map((step, index) => (
                                    <div
                                        key={step}
                                        className={`${styles.step} ${index === activeStep ? styles.activeStep : ''}`}
                                    >
                                        <span>{index + 1}</span>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.rightPanel}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function AuthCard({ title, description, children, footer }) {
    return (
        <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
                <img src="/Logo-Dark.png" alt="ObserveX" className={styles.logoImage} />
                <h1 className={styles.title}>{title}</h1>
                {description && <p className={styles.description}>{description}</p>}
            </div>
            <div className={styles.cardContent}>
                {children}
                {footer}
            </div>
        </div>
    );
}
