import styles from '../../styles/modules/ui/PageFallback.module.scss';

export function PageFallback({ message = "Loading view...", subtitle = "Preparing dashboard data" }) {
    return (
        <div className={styles.fallbackContainer} role="status" aria-label={message}>
            <div className={styles.loaderCard}>
                <div className={styles.spinnerWrapper}>
                    <div className={styles.spinnerOuter} />
                    <div className={styles.spinnerInnerGlow} />
                </div>
                <div className={styles.textGroup}>
                    <span className={styles.title}>{message}</span>
                    <span className={styles.subtitle}>{subtitle}</span>
                </div>
                <div className={styles.shimmerBar}>
                    <div className={styles.shimmerFill} />
                </div>
            </div>
        </div>
    );
}

export default PageFallback;
