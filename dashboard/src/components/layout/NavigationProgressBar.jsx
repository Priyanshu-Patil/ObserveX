import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../styles/modules/layout/NavigationProgressBar.module.scss';

export function NavigationProgressBar() {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const timersRef = useRef([]);

    const clearTimers = () => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current = [];
    };

    useEffect(() => {
        // Trigger smooth progress animation on route change
        clearTimers();
        setVisible(true);
        setOpacity(1);
        setProgress(28);

        const t1 = setTimeout(() => {
            setProgress(72);
        }, 80);

        const t2 = setTimeout(() => {
            setProgress(100);
        }, 220);

        const t3 = setTimeout(() => {
            setOpacity(0);
        }, 360);

        const t4 = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 580);

        timersRef.current = [t1, t2, t3, t4];

        return () => {
            clearTimers();
        };
    }, [location.pathname, location.search]);

    if (!visible) return null;

    return (
        <div className={styles.progressBarContainer} aria-hidden="true">
            <div className={styles.progressBarTrack}>
                <div
                    className={styles.progressBarFill}
                    style={{
                        width: `${progress}%`,
                        opacity: opacity,
                    }}
                >
                    <div className={styles.progressBarGlow} />
                </div>
            </div>
        </div>
    );
}

export default NavigationProgressBar;
