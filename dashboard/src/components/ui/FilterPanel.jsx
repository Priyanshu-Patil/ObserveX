import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function FilterPanel({ filters = [] }) {
    if (!filters.length) return null;

    return (
        <div className={styles.filterPanel} role="group" aria-label="Filters">
            {filters.map((filter) => (
                <div key={filter.id} className={styles.filterGroup}>
                    <label htmlFor={filter.id} className={styles.filterLabel}>{filter.label}</label>
                    {filter.type === 'select' ? (
                        <select
                            id={filter.id}
                            className={styles.filterSelect}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={filter.id}
                            type={filter.type ?? 'text'}
                            className={styles.filterSelect}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            placeholder={filter.placeholder}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
