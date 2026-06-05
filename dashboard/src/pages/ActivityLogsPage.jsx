import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterPanel } from '../components/ui/FilterPanel';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import { Modal } from '../components/ui/ConfirmationModal';
import { Button } from '../components/ui/Button';
import { PageStatus } from '../components/ui/PageStatus';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/PageComponents.module.scss';

const EVENT_TYPES = [
    { value: 'all', label: 'All Events' },
    { value: 'api', label: 'API Traffic' },
    { value: 'login', label: 'Login' },
    { value: 'client', label: 'Client Created' },
    { value: 'user', label: 'User Created' },
    { value: 'key', label: 'API Key' },
];

export function ActivityLogsPage() {
    const toast = useToast();
    const { isSuperAdmin, clientId, user } = useAuth();
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [visibleCount, setVisibleCount] = useState(20);
    const debouncedSearch = useDebounce(search);
    const params = isSuperAdmin ? {} : { clientId };

    const { data, isPending, error, refetch } = useDashboardQuery(params);
    const recentActivity = data?.data?.recentActivity ?? [];

    const events = useMemo(() => {
        const base = [
            { id: 'login', title: 'Session active', timestamp: new Date().toISOString(), user: user?.username, type: 'login', detail: `Logged in as ${user?.role}` },
            ...recentActivity.map((item, i) => ({
                id: `api-${i}`,
                title: `${item.method} ${item.endpoint}`,
                timestamp: item.timeBucket ?? new Date().toISOString(),
                type: 'api',
                detail: `${item.totalHits} requests, ${item.errorHits} errors, ${item.avgLatency}ms avg`,
            })),
        ];
        return base.filter((e) => {
            const matchType = eventType === 'all' || e.type === eventType;
            const q = debouncedSearch.toLowerCase();
            const matchSearch = !q || e.title.toLowerCase().includes(q) || e.detail?.toLowerCase().includes(q);
            return matchType && matchSearch;
        });
    }, [recentActivity, user, eventType, debouncedSearch]);

    const visibleEvents = events.slice(0, visibleCount);

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Activity logs exported', 'success');
    };

    if (isPending || error) {
        return <PageStatus isLoading={isPending} error={error} onRetry={refetch} />;
    }

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="Activity Logs"
                description="Audit trail of platform and API events"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Activity' }]}
                actions={<Button variant="outline" onClick={handleExport}><Download size={16} /> Export</Button>}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." />
            </div>
            <FilterPanel filters={[
                { id: 'type', label: 'Event Type', type: 'select', value: eventType, onChange: setEventType, options: EVENT_TYPES },
            ]} />
            <ActivityTimeline events={visibleEvents} />
            {visibleCount < events.length && (
                <div style={{ textAlign: 'center' }}>
                    <Button variant="outline" onClick={() => setVisibleCount((c) => c + 20)}>Load More</Button>
                </div>
            )}
            <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details">
                {selectedEvent && <pre style={{ fontSize: '0.8125rem', overflow: 'auto' }}>{JSON.stringify(selectedEvent, null, 2)}</pre>}
            </Modal>
        </div>
    );
}
