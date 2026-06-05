import { Search } from 'lucide-react';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function SearchInput({ value, onChange, placeholder = 'Search...', className, ...props }) {
    return (
        <div className={`${styles.searchWrapper} ${className ?? ''}`}>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
                type="search"
                className={styles.searchInput}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                aria-label={placeholder}
                {...props}
            />
        </div>
    );
}
