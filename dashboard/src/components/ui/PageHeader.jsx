import { Breadcrumbs } from './Breadcrumbs';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function PageHeader({ title, description, breadcrumbs, actions, children }) {
    return (
        <header>
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderText}>
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                    {children}
                </div>
                {actions && <div className={styles.pageHeaderActions}>{actions}</div>}
            </div>
        </header>
    );
}
