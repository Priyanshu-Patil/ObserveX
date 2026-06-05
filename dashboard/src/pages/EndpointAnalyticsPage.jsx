import { useState, useMemo } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { DataTable } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';
import { StatusBadge } from '../components/ui/StatusBadge';
import uiStyles from '../styles/modules/ui/SharedUi.module.scss';
import { PageStatus } from '../components/ui/PageStatus';
import { useDebounce } from '../hooks/useDebounce';
import { getMethodColor } from '../lib/utils';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function EndpointAnalyticsPage() {
    const { isSuperAdmin, clientId } = useAuth();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const debouncedSearch = useDebounce(search);
    const params = isSuperAdmin ? {} : { clientId };

    const { data, isPending, error, refetch } = useDashboardQuery(params);
    const endpoints = data?.data?.topEndpoints ?? [];

    const filtered = useMemo(() => {
        const q = debouncedSearch.toLowerCase();
        return endpoints.filter((ep) =>
            !q || ep.endpoint?.toLowerCase().includes(q) || ep.serviceName?.toLowerCase().includes(q)
        );
    }, [endpoints, debouncedSearch]);

    const worst = [...endpoints].sort((a, b) => (b.errorRate ?? 0) - (a.errorRate ?? 0)).slice(0, 5);
    const slowest = [...endpoints].sort((a, b) => (b.avgLatency ?? 0) - (a.avgLatency ?? 0)).slice(0, 5);

    const columns = [
        {
            key: 'endpoint',
            header: 'Endpoint',
            render: (row) => (
                <button type="button" onClick={() => setSelected(row)} style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                    <span style={{ color: getMethodColor(row.method), marginRight: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{row.method}</span>
                    {row.endpoint}
                </button>
            ),
        },
        { key: 'serviceName', header: 'Service' },
        { key: 'totalHits', header: 'Requests', sortValue: (r) => r.totalHits },
        { key: 'avgLatency', header: 'Avg Latency', sortValue: (r) => parseFloat(r.avgLatency), render: (r) => `${r.avgLatency}ms` },
        { key: 'errorRate', header: 'Error Rate', sortValue: (r) => parseFloat(r.errorRate), render: (r) => <StatusBadge status={parseFloat(r.errorRate) > 5 ? 'expired' : 'active'}>{r.errorRate}%</StatusBadge> },
    ];

    if (isPending || error) {
        return <PageStatus isLoading={isPending} error={error} onRetry={refetch} />;
    }

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="Endpoint Analytics"
                description="Performance breakdown by endpoint"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Analytics', href: '/analytics' }, { label: 'Endpoints' }]}
            />
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search endpoints..." />
            <div className={styles.gridTwoCols}>
                <div>
                    <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Worst Performing</h3>
                    {worst.map((ep) => (
                        <div key={ep.endpoint} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.875rem' }}>
                            {ep.method} {ep.endpoint} — <strong>{ep.errorRate}%</strong> errors
                        </div>
                    ))}
                </div>
                <div>
                    <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Slowest Endpoints</h3>
                    {slowest.map((ep) => (
                        <div key={ep.endpoint} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.875rem' }}>
                            {ep.method} {ep.endpoint} — <strong>{ep.avgLatency}ms</strong>
                        </div>
                    ))}
                </div>
            </div>
            <DataTable columns={columns} data={filtered} emptyTitle="No endpoints found" emptyDescription="Endpoints will appear once API traffic is recorded." />

            <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.endpoint ?? 'Endpoint Details'}>
                {selected && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className={uiStyles.drawerMetrics}>
                            <div className={uiStyles.drawerMetric}><span>Total Hits</span><strong>{Number(selected.totalHits).toLocaleString()}</strong></div>
                            <div className={uiStyles.drawerMetric}><span>Error Rate</span><strong>{selected.errorRate}%</strong></div>
                            <div className={uiStyles.drawerMetric}><span>Avg Latency</span><strong>{selected.avgLatency}ms</strong></div>
                            <div className={uiStyles.drawerMetric}><span>Error Hits</span><strong>{Number(selected.errorHits).toLocaleString()}</strong></div>
                        </div>
                        <div className={uiStyles.drawerDetails}>
                            <h4>Endpoint Details</h4>
                            <p>
                                <strong>Service:</strong> {selected.serviceName}<br />
                                <strong>Method:</strong> {selected.method}<br />
                                <strong>Path:</strong> {selected.endpoint}
                            </p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
