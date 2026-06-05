import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';
import { Pagination } from './Pagination';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function DataTable({
    columns,
    data = [],
    isLoading,
    emptyTitle = 'No results',
    emptyDescription,
    pageSize = 10,
    selectable,
    selectedIds = [],
    onSelectionChange,
    getRowId = (row) => row._id ?? row.id,
}) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);

    const sorted = useMemo(() => {
        if (!sortKey) return data;
        const col = columns.find((c) => c.key === sortKey);
        const accessor = col?.sortValue ?? ((row) => row[sortKey]);
        return [...data].sort((a, b) => {
            const av = accessor(a);
            const bv = accessor(b);
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir, columns]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const toggleRow = (id) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((x) => x !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const toggleAll = () => {
        if (!onSelectionChange) return;
        const pageIds = paged.map(getRowId);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
        } else {
            onSelectionChange([...new Set([...selectedIds, ...pageIds])]);
        }
    };

    if (isLoading) return <TableSkeleton />;

    if (!data.length) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {selectable && (
                                <th>
                                    <input
                                        type="checkbox"
                                        aria-label="Select all rows"
                                        checked={paged.length > 0 && paged.every((r) => selectedIds.includes(getRowId(r)))}
                                        onChange={toggleAll}
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(col.sortable !== false && styles.sortable)}
                                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                                    aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {col.header}
                                        {col.sortable !== false && (
                                            sortKey === col.key
                                                ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)
                                                : <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((row) => {
                            const id = getRowId(row);
                            return (
                                <tr key={id}>
                                    {selectable && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select row ${id}`}
                                                checked={selectedIds.includes(id)}
                                                onChange={() => toggleRow(id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {sorted.length > pageSize && (
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={sorted.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}
