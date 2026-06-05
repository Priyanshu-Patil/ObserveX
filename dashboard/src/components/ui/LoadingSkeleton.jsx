import { cn } from '../../lib/utils';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function LoadingSkeleton({ className, variant = 'row' }) {
    const variantClass = variant === 'card' ? styles.skeletonCard : styles.skeletonRow;
    return <div className={cn(styles.skeleton, variantClass, className)} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div role="status" aria-label="Loading">
            {Array.from({ length: rows }).map((_, i) => (
                <LoadingSkeleton key={i} />
            ))}
        </div>
    );
}

export function CardGridSkeleton({ count = 4 }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }} role="status" aria-label="Loading">
            {Array.from({ length: count }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" />
            ))}
        </div>
    );
}
