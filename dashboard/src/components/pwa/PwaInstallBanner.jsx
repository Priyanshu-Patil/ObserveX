import React, { useState, useEffect } from 'react';
import { usePwa } from '../../contexts/PwaContext';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './PwaBanner.module.scss';

export function PwaInstallBanner() {
    const { showBanner, installPwa, dismissBanner, isInstalled } = usePwa();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (!showBanner || isInstalled) return;

        // Automatically dismiss banner after 5 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                dismissBanner();
            }, 250);
        }, 3000);

        return () => clearTimeout(timer);
    }, [showBanner, isInstalled, dismissBanner]);

    const handleManualDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            dismissBanner();
        }, 250);
    };

    if (!showBanner || isInstalled) {
        return null;
    }

    return (
        <aside
            className={`${styles.bannerContainer} ${isExiting ? styles.exiting : ''}`}
            aria-label="Install ObserveX"
            role="region"
        >
            <div className={styles.bannerCard}>
                <img
                    src="/2.png"
                    alt="ObserveX"
                    className={styles.appIcon}
                />

                <div className={styles.content}>
                    <div className={styles.headerRow}>
                        <h4 className={styles.title}>Install ObserveX</h4>
                    </div>
                    <p className={styles.description}>
                        Install for faster access, desktop integration, and offline metric tracking.
                    </p>
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={installPwa}
                        className={styles.installBtn}
                    >
                        <Download size={14} aria-hidden="true" />
                        <span>Install</span>
                    </Button>
                    <button
                        type="button"
                        onClick={handleManualDismiss}
                        className={styles.dismissBtn}
                        aria-label="Dismiss banner"
                    >
                        <X size={15} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default PwaInstallBanner;
