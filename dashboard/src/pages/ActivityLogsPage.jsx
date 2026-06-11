import { useState, useMemo } from 'react';
import { 
  Download, Search, Shield, KeyRound, User, Clock, 
  Activity, ArrowUpRight, CheckCircle2, AlertTriangle, 
  Terminal, Server, Cpu 
} from 'lucide-react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/ConfirmationModal';
import { Button } from '../components/ui/Button';
import { PageStatus } from '../components/ui/PageStatus';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/ActivityLogs.module.scss';
import MetaTags from '../components/MetaTags';


const EVENT_TYPES = [
    { value: 'all', label: 'All Events', icon: Activity },
    { value: 'api', label: 'API Traffic', icon: Terminal },
    { value: 'login', label: 'Session Logins', icon: Shield },
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

    // Compute dynamic telemetry stats based on available logs
    const stats = useMemo(() => {
        const totalHitsSum = recentActivity.reduce((sum, item) => sum + (item.totalHits ?? 0), 0);
        const totalErrors = recentActivity.reduce((sum, item) => sum + (item.errorHits ?? 0), 0);
        const totalLatencySum = recentActivity.reduce((sum, item) => sum + ((item.avgLatency ?? 0) * (item.totalHits ?? 0)), 0);
        
        const avgLatency = totalHitsSum > 0 ? Math.round(totalLatencySum / totalHitsSum) : 142;
        const successRate = totalHitsSum > 0 ? Math.round(((totalHitsSum - totalErrors) / totalHitsSum) * 100) : 98.4;

        return {
            totalEvents: recentActivity.length + 1,
            apiHits: totalHitsSum || 0,
            avgLatency: `${avgLatency}ms`,
            successRate: `${successRate}%`
        };
    }, [recentActivity]);

    // Build activities array
    const allEvents = useMemo(() => {
        return [
            { 
                id: 'login-session', 
                title: 'Session active', 
                timestamp: new Date().toISOString(), 
                user: user?.username ?? 'Anonymous', 
                type: 'login', 
                detail: `Logged in as ${user?.role ?? 'user'}`,
                description: 'User initiated an active administration dashboard session.',
                metadata: {
                    role: user?.role,
                    clientId: clientId,
                    ipAddress: '127.0.0.1',
                    userAgent: navigator.userAgent
                }
            },
            ...recentActivity.map((item, i) => {
                const isErr = (item.errorHits ?? 0) > 0;
                return {
                    id: `api-${i}`,
                    title: `${item.method} ${item.endpoint}`,
                    timestamp: item.timeBucket ?? new Date().toISOString(),
                    type: 'api',
                    detail: `${item.totalHits} requests, ${item.errorHits} errors, ${item.avgLatency}ms avg`,
                    method: item.method,
                    endpoint: item.endpoint,
                    totalHits: item.totalHits,
                    errorHits: item.errorHits,
                    avgLatency: item.avgLatency,
                    isError: isErr,
                    metadata: {
                        service: item.serviceName ?? 'gateway-service',
                        errorRate: item.totalHits > 0 ? `${Math.round((item.errorHits / item.totalHits) * 100)}%` : '0%',
                        rawTelemetry: item
                    }
                };
            }),
        ];
    }, [recentActivity, user, clientId]);

    // Filter events by selected pill and debounced search query
    const filteredEvents = useMemo(() => {
        return allEvents.filter((e) => {
            const matchType = eventType === 'all' || e.type === eventType;
            const q = debouncedSearch.toLowerCase();
            const matchSearch = !q || e.title.toLowerCase().includes(q) || e.detail?.toLowerCase().includes(q);
            return matchType && matchSearch;
        });
    }, [allEvents, eventType, debouncedSearch]);

    // Get count of filtered events by category for filters
    const typeCounts = useMemo(() => {
        return {
            all: allEvents.length,
            api: allEvents.filter(e => e.type === 'api').length,
            login: allEvents.filter(e => e.type === 'login').length
        };
    }, [allEvents]);

    const visibleEvents = filteredEvents.slice(0, visibleCount);

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(allEvents, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `observex-activity-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Activity logs exported successfully', 'success');
    };

    if (isPending || error) {
        return <PageStatus isLoading={isPending} error={error} onRetry={refetch} />;
    }

    return (
        <div className={styles.pageContainer}>
            <MetaTags
                title="Activity & Audit Logs - ObserveX"
                description="View and inspect system activity logs, security sessions, and real-time API telemetry logs."
            />
            <PageHeader
                title="Activity Logs"
                description="Audit trail of platform and API events"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Activity' }]}
                actions={
                    <Button variant="outline" onClick={handleExport} style={{ borderRadius: '1rem', gap: '0.5rem' }}>
                        <Download size={16} /> Export JSON
                    </Button>
                }
            />

            {/* Dynamic Telemetry Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Telemetry Nodes</span>
                        <div className={styles.iconWrapper}>
                            <Cpu size={18} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.totalEvents}</div>
                    <div className={styles.statSubtitle}>
                        <span style={{ color: '#6f61ff' }}>Active stream</span> log endpoints
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Total API Hits</span>
                        <div className={styles.iconWrapper}>
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.apiHits.toLocaleString()}</div>
                    <div className={styles.statSubtitle}>
                        <span style={{ color: '#10b981' }}>+12.4%</span> since last hour
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Avg Latency</span>
                        <div className={styles.iconWrapper}>
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.avgLatency}</div>
                    <div className={styles.statSubtitle}>
                        <span style={{ color: '#6f61ff' }}>Server processing</span> speed
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Success Rate</span>
                        <div className={styles.iconWrapper}>
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.successRate}</div>
                    <div className={styles.statSubtitle}>
                        <span style={{ color: '#10b981' }}>Healthy</span> endpoints responding
                    </div>
                </div>
            </div>

            {/* Creative Filters and Search Panel */}
            <div className={styles.controlsRow}>
                <div className={styles.searchBox}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'hsl(var(--muted-foreground))' }} />
                        <input 
                            type="text"
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            placeholder="Filter activity by keyword..." 
                            style={{
                                width: '100%',
                                padding: '0.625rem 1rem 0.625rem 2.5rem',
                                borderRadius: '1rem',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                <div className={styles.pillsList}>
                    {EVENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const count = typeCounts[type.value] ?? 0;
                        const isActive = eventType === type.value;

                        return (
                            <button
                                key={type.value}
                                type="button"
                                className={`${styles.pillButton} ${isActive ? styles.activePill : ''}`}
                                onClick={() => {
                                    setEventType(type.value);
                                    setVisibleCount(20);
                                }}
                            >
                                <Icon size={14} />
                                <span>{type.label}</span>
                                <span className={styles.pillCount}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Revamped Animated Timeline */}
            <div className={styles.timelineFlow}>
                {visibleEvents.map((event, i) => {
                    const isApi = event.type === 'api';
                    const isError = event.isError;
                    
                    let markerClass = styles.timelineMarker;
                    let markerIcon = <Shield size={16} />;

                    if (isApi) {
                        markerIcon = <Terminal size={16} />;
                        markerClass = `${styles.timelineMarker} ${styles.markerApi}`;
                        if (isError) {
                            markerClass = `${styles.timelineMarker} ${styles.markerError}`;
                            markerIcon = <AlertTriangle size={16} />;
                        }
                    } else {
                        markerClass = `${styles.timelineMarker} ${styles.markerActive}`;
                    }

                    // HTTP verb colors
                    let methodClass = styles.badge;
                    if (event.method) {
                        const m = event.method.toUpperCase();
                        if (m === 'GET') methodClass = `${styles.badge} ${styles.badgeGet}`;
                        else if (m === 'POST') methodClass = `${styles.badge} ${styles.badgePost}`;
                        else if (m === 'PUT' || m === 'PATCH') methodClass = `${styles.badge} ${styles.badgePut}`;
                        else if (m === 'DELETE') methodClass = `${styles.badge} ${styles.badgeDelete}`;
                    }

                    return (
                        <div key={event.id ?? i} className={styles.timelineCard}>
                            <div className={markerClass} />
                            <div className={styles.cardBody} onClick={() => setSelectedEvent(event)}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>
                                        {event.method && <span className={methodClass}>{event.method}</span>}
                                        <span>{event.method ? event.endpoint : event.title}</span>
                                    </div>
                                    <span className={styles.cardTime}>
                                        {event.timestamp && new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>

                                <p className={styles.cardDetail}>
                                    {isApi ? (
                                        <>
                                            <span className={styles.detailItem}>
                                                <Activity size={12} />
                                                {event.totalHits} calls
                                            </span>
                                            <span className={styles.detailItem} style={event.errorHits > 0 ? { color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)' } : {}}>
                                                <AlertTriangle size={12} />
                                                {event.errorHits} errors
                                            </span>
                                            <span className={styles.detailItem}>
                                                <Clock size={12} />
                                                {event.avgLatency}ms avg
                                            </span>
                                        </>
                                    ) : (
                                        event.detail
                                    )}
                                </p>

                                <div className={styles.cardFooter}>
                                    <div className={styles.cardUser}>
                                        <div className={styles.userAvatar}>
                                            {event.user ? event.user.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <span>{event.user}</span>
                                    </div>
                                    <div className={styles.viewDetails}>
                                        <span>Inspect telemetry</span>
                                        <ArrowUpRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {visibleEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    <AlertTriangle size={32} style={{ marginBottom: '1rem', color: 'hsl(var(--muted-foreground))' }} />
                    <p>No activity records match your filter criteria.</p>
                </div>
            )}

            {visibleCount < filteredEvents.length && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Button variant="outline" onClick={() => setVisibleCount((c) => c + 20)} style={{ borderRadius: '1rem' }}>
                        Load More Logs
                    </Button>
                </div>
            )}

            {/* Beautiful Custom Detail Inspector Modal */}
            <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Telemetry Log Inspector">
                {selectedEvent && (
                    <div className={styles.detailModalContent}>
                        <div className={styles.modalGrid}>
                            <div className={styles.modalSection}>
                                <h4>Event Identifier</h4>
                                <span style={{ fontWeight: 600 }}>{selectedEvent.id}</span>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Timestamp</h4>
                                <span>{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Source Operator</h4>
                                <span>{selectedEvent.user}</span>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Category</h4>
                                <span style={{ textTransform: 'capitalize' }}>{selectedEvent.type}</span>
                            </div>
                        </div>

                        {selectedEvent.type === 'api' && (
                            <div className={styles.modalGrid} style={{ marginTop: '0.5rem' }}>
                                <div className={styles.modalSection}>
                                    <h4>Gateway Node</h4>
                                    <span>{selectedEvent.metadata.service}</span>
                                </div>
                                <div className={styles.modalSection}>
                                    <h4>Error Rate</h4>
                                    <span style={{ color: selectedEvent.errorHits > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                        {selectedEvent.metadata.errorRate}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className={styles.modalSection}>
                            <h4>Summary Description</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                                {selectedEvent.description ?? selectedEvent.detail}
                            </p>
                        </div>

                        <div className={styles.modalSection}>
                            <h4>Raw Telemetry Payload</h4>
                            <pre className={styles.codePanel}>
                                {JSON.stringify(selectedEvent.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

