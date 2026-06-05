import { Inbox } from 'lucide-react';
import { Button } from './Button';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function EmptyState({
    icon: Icon = Inbox,
    title = 'No data found',
    description,
    actionLabel,
    onAction,
}) {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
                <Icon aria-hidden="true" />
            </div>
            <h3 className={styles.emptyTitle}>{title}</h3>
            {description && <p className={styles.emptyDescription}>{description}</p>}
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}
