import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Portal } from './Portal';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function Drawer({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <Portal>
            <div className={styles.drawerOverlay} onClick={onClose} aria-hidden="true" />
            <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={title}>
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{title}</h2>
                    <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className={styles.drawerBody}>{children}</div>
            </aside>
        </Portal>
    );
}
