import { useState, useMemo } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { FilterPanel } from '../components/ui/FilterPanel';
import { Button } from '../components/ui/Button';
import { PageStatus } from '../components/ui/PageStatus';
import StatsGrid from '../components/StatsGrid';
import { ApiHitsChart, StatusDistributionChart, LatencyChart } from '../components/charts';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function AnalyticsOverviewPage() {
    const toast = useToast();
    const { isSuperAdmin, clientId } = useAuth();
    const [dateRange, setDateRange] = useState('24h');
    const [service, setService] = useState('all');

    const params = useMemo(() => {
        const p = isSuperAdmin ? {} : { clientId };
        const now = new Date();
        const start = new Date();
        if (dateRange === '24h') start.setHours(start.getHours() - 24);
        else if (dateRange === '7d') start.setDate(start.getDate() - 7);
        else start.setDate(start.getDate() - 30);
        p.startTime = start.toISOString();
        p.endTime = now.toISOString();
        return p;
    }, [dateRange, isSuperAdmin, clientId]);

    const { data, isPending, error, refetch, isFetching } = useDashboardQuery(params);
    const stats = data?.data?.stats;
    const recentActivity = data?.data?.recentActivity ?? [];

    const latencyData = useMemo(() => ({
        categories: recentActivity.map((_, i) => `T${i + 1}`),
        avgLatency: recentActivity.map((a) => parseFloat(a.avgLatency) || 0),
        p95Latency: recentActivity.map((a) => parseFloat(a.maxLatency) || (parseFloat(a.avgLatency) || 0) * 1.5),
    }), [recentActivity]);

    const handleExport = () => {
        if (!stats) return;
        const blob = new Blob([JSON.stringify({ stats, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Analytics exported', 'success');
    };

    if (isPending || error) {
        return <PageStatus isLoading={isPending} error={error} onRetry={refetch} />;
    }

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="Analytics Overview"
                description="Enterprise-grade API performance insights"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Analytics' }]}
                actions={
                    <>
                        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCw size={16} className={isFetching ? styles.iconSm : ''} style={isFetching ? { animation: 'spin 1s linear infinite' } : undefined} /> Refresh
                        </Button>
                        <Button variant="outline" onClick={handleExport}><Download size={16} /> Export</Button>
                    </>
                }
            />
            <FilterPanel filters={[
                { id: 'range', label: 'Date Range', type: 'select', value: dateRange, onChange: setDateRange, options: [
                    { value: '24h', label: 'Last 24 Hours' }, { value: '7d', label: 'Last 7 Days' }, { value: '30d', label: 'Last 30 Days' },
                ]},
                { id: 'service', label: 'Service', type: 'select', value: service, onChange: setService, options: [
                    { value: 'all', label: 'All Services' },
                    ...[...new Set((data?.data?.topEndpoints ?? []).map((e) => e.serviceName))].map((s) => ({ value: s, label: s })),
                ]},
            ]} />
            <StatsGrid stats={stats} recentActivity={recentActivity} showPercentiles />
            <div className={styles.gridTwoCols}>
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={{ labels: ['Success (2xx)', 'Errors (4xx/5xx)'], values: [stats?.successHits ?? 0, stats?.errorHits ?? 0] }} />
            </div>
            {latencyData.avgLatency.length > 0 && <LatencyChart data={latencyData} />}
        </div>
    );
}
