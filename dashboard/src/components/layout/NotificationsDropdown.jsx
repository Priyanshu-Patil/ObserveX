import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Info } from 'lucide-react';
import styles from '../../styles/modules/layout/NotificationsDropdown.module.scss';

const DEFAULT_NOTIFICATIONS = [
    { id: 1, type: 'info', title: 'Welcome to ObserveX', time: 'Just now' },
    { id: 2, type: 'success', title: 'Dashboard data refreshed', time: '5m ago' },
];

export function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications] = useState(DEFAULT_NOTIFICATIONS);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(!open)}
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell size={18} aria-hidden="true" />
                {notifications.length > 0 && (
                    <span className={styles.badge}>{notifications.length}</span>
                )}
            </button>
            {open && (
                <div className={styles.dropdown} role="menu">
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                    </div>
                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <p className={styles.empty}>No new notifications</p>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={styles.item} role="menuitem">
                                    {n.type === 'success' ? (
                                        <CheckCircle size={16} className={styles.iconSuccess} aria-hidden="true" />
                                    ) : (
                                        <Info size={16} className={styles.iconInfo} aria-hidden="true" />
                                    )}
                                    <div>
                                        <p className={styles.itemTitle}>{n.title}</p>
                                        <p className={styles.itemTime}>{n.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
