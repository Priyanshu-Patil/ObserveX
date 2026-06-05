import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function ActivityTimeline({ events = [] }) {
    return (
        <div className={styles.timeline}>
            {events.map((event, i) => (
                <div key={event.id ?? i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelineContent}>
                        <p className={styles.timelineTitle}>{event.title}</p>
                        <p className={styles.timelineMeta}>
                            {event.timestamp && new Date(event.timestamp).toLocaleString()}
                            {event.user && ` · ${event.user}`}
                            {event.detail && ` · ${event.detail}`}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
