import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, BarChart3, UserPlus } from 'lucide-react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import StatsGrid from '../components/StatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageStatus } from '../components/ui/PageStatus';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart } from '../components/charts';
import styles from '../styles/modules/pages/PageComponents.module.scss';
import MetaTags from '../components/MetaTags';


export function ClientDashboardPage() {
    const navigate = useNavigate();
    const { user, clientId, isSuperAdmin } = useAuth();
    const params = isSuperAdmin ? {} : { clientId };
    const { data, isPending, error, refetch } = useDashboardQuery(params);

    const stats = data?.data?.stats;
    const topEndpoints = data?.data?.topEndpoints ?? [];
    const recentActivity = data?.data?.recentActivity ?? [];

    const timelineEvents = useMemo(() =>
        recentActivity.slice(0, 8).map((item, i) => ({
            id: i,
            title: `${item.method} ${item.endpoint}`,
            timestamp: item.timeBucket,
            detail: `${item.totalHits} hits · ${item.avgLatency}ms avg`,
        })),
    [recentActivity]);

    if (isPending || error) {
        return <PageStatus isLoading={isPending} error={error} onRetry={refetch} loadingText="Loading dashboard..." errorText="Failed to load dashboard" />;
    }

    const apiKeysPath = clientId ? `/admin/clients/${clientId}/api-keys` : '/admin/clients';

    return (
        <div className={styles.pageContainer}>
            <MetaTags
                title="Dashboard - ObserveX"
                description="ObserveX real-time API monitoring dashboard. Track latency, status codes, request volumes, and system performance."
            />
            <PageHeader
                title={`Welcome back${user?.username ? `, ${user.username}` : ''}`}
                description="Monitor your API traffic, performance, and health in real time"
            />
            <StatsGrid stats={stats} recentActivity={recentActivity} />

            <div className={styles.gridTwoCols}>
                <ApiHitsChart stats={stats} />
                <Card className={styles.sectionCard}>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Button variant="outline" className={styles.fullWidthBtn} onClick={() => navigate(apiKeysPath)}><Key size={16} /> Generate API Key</Button>
                        <Button variant="outline" className={styles.fullWidthBtn} onClick={() => navigate('/analytics')}><BarChart3 size={16} /> View Analytics</Button>
                        {isSuperAdmin && (
                            <Button variant="outline" className={styles.fullWidthBtn} onClick={() => navigate('/admin/clients')}><UserPlus size={16} /> Manage Clients</Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <TopEndpoints endpoints={topEndpoints} />

            {timelineEvents.length > 0 && (
                <Card className={styles.sectionCard}>
                    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                    <CardContent><ActivityTimeline events={timelineEvents} /></CardContent>
                </Card>
            )}
        </div>
    );
}
