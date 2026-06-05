import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
                Showing {start}–{end} of {totalItems}
            </span>
            <div className={styles.paginationControls}>
                <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (page <= 3) {
                        pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = page - 2 + i;
                    }
                    return (
                        <button
                            key={pageNum}
                            type="button"
                            className={`${styles.pageBtn} ${pageNum === page ? styles.active : ''}`}
                            onClick={() => onPageChange(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={pageNum === page ? 'page' : undefined}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
