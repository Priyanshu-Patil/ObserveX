import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function Breadcrumbs({ items = [] }) {
    if (!items.length) return null;

    return (
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={item.label} style={{ display: 'contents' }}>
                        {i > 0 && <ChevronRight size={14} className={styles.breadcrumbSep} aria-hidden="true" />}
                        {isLast || !item.href ? (
                            <span className={styles.breadcrumbCurrent} aria-current="page">{item.label}</span>
                        ) : (
                            <Link to={item.href} className={styles.breadcrumbLink}>{item.label}</Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
