import { useEffect } from 'react';
import { Button } from './Button';
import { Portal } from './Portal';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'destructive',
    isLoading,
}) {
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
            <div
                className={styles.modalOverlay}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                onClick={onClose}
            >
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2 id="confirm-title" className={styles.modalTitle}>{title}</h2>
                        {description && <p className={styles.modalDescription}>{description}</p>}
                    </div>
                    <div className={styles.modalFooter}>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            {cancelLabel}
                        </Button>
                        <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
                            {isLoading ? 'Processing...' : confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}

export function Modal({ open, onClose, title, description, children, footer }) {
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
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{title}</h2>
                        {description && <p className={styles.modalDescription}>{description}</p>}
                    </div>
                    <div className={styles.modalBody}>{children}</div>
                    {footer && <div className={styles.modalFooter}>{footer}</div>}
                </div>
            </div>
        </Portal>
    );
}
