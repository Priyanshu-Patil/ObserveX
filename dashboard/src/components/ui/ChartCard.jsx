import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function ChartCard({ title, description, children, actions }) {
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 className={styles.chartCardTitle}>{title}</h3>
                    {description && <p className={styles.chartCardDescription}>{description}</p>}
                </div>
                {actions}
            </div>
            <div className={styles.chartCardBody}>{children}</div>
        </div>
    );
}
