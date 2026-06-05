import { cn } from '../../lib/utils';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function StatCard({ label, value, icon: Icon, change, className }) {
    return (
        <div className={cn(styles.statCard, className)}>
            <div className={styles.statHeader}>
                <span className={styles.statLabel}>{label}</span>
                {Icon && (
                    <div className={styles.statIcon}>
                        <Icon aria-hidden="true" />
                    </div>
                )}
            </div>
            <p className={styles.statValue}>{value}</p>
            {change && <p className={styles.statChange}>{change}</p>}
        </div>
    );
}

export function MetricCard(props) {
    return <StatCard {...props} />;
}
