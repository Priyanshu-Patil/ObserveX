import React, { useState, useEffect } from 'react';
import { usePwa } from '../../contexts/PwaContext';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import styles from './OfflineIndicator.module.scss';

export function OfflineIndicator() {
    const { isOffline, triggerHaptic } = usePwa();
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (isOffline) {
            setWasOffline(true);
            setShowReconnected(false);
            triggerHaptic('warning');
        } else if (wasOffline) {
            // Just came back online
            setShowReconnected(true);
            triggerHaptic('success');
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isOffline, wasOffline, triggerHaptic]);

    if (!isOffline && !showReconnected) {
        return null;
    }

    return (
        <div
            className={`${styles.container} ${isOffline ? styles.offline : styles.reconnected}`}
            role="status"
            aria-live="polite"
        >
            <div className={styles.pill}>
                <span className={styles.iconPulse}>
                    {isOffline ? (
                        <WifiOff size={16} aria-hidden="true" />
                    ) : (
                        <Wifi size={16} aria-hidden="true" />
                    )}
                </span>
                <div className={styles.textGroup}>
                    <span className={styles.statusTitle}>
                        {isOffline ? 'Offline Mode Active' : 'Back Online'}
                    </span>
                    <span className={styles.statusSubtitle}>
                        {isOffline
                            ? 'Viewing cached API telemetry data'
                            : 'Live metrics stream synchronized'}
                    </span>
                </div>
                {isOffline && (
                    <span className={styles.indicatorBadge}>
                        <RefreshCw size={12} className={styles.spinning} aria-hidden="true" />
                        <span>Cached</span>
                    </span>
                )}
            </div>
        </div>
    );
}

export default OfflineIndicator;
