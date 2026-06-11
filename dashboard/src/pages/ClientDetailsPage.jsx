import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Key, Activity, BarChart3 } from 'lucide-react';

import { clientApi } from '../api/api';
import { QUERY_KEYS } from '../constants';

import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { StatCard } from '../components/ui/StatCard';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ApiKeyCard } from '../components/ui/ApiKeyCard';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton';

import { useDashboardQuery } from '../hooks/useDashboardQuery';

import {
    ApiHitsChart,
    StatusDistributionChart,
} from '../components/charts';

import styles from '../styles/modules/pages/PageComponents.module.scss';
import MetaTags from '../components/MetaTags';


export function ClientDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: usersData,
        isLoading: usersLoading,
    } = useQuery({
        queryKey: ['client-users', id],
        queryFn: () =>
            clientApi.getClientUsers(id),
        enabled: !!id,
    });

    const users = usersData?.data ?? [];

    const {
        data: clientResponse,
        isLoading: clientLoading,
        error: clientError,
    } = useQuery({
        queryKey: ['client', id],
        queryFn: () => clientApi.getClient(id),
        enabled: !!id,
    });

    const client = clientResponse?.data;

    const {
        data: keysData,
        isLoading: keysLoading,
    } = useQuery({
        queryKey: QUERY_KEYS.API_KEYS(id),
        queryFn: () =>
            clientApi.getClientApiKeys(id),
        enabled: !!id,
    });

    const { data: dashData } =
        useDashboardQuery({
            clientId: id,
        });

    const stats =
        dashData?.data?.stats;

    const topEndpoints =
        dashData?.data?.topEndpoints ??
        [];

    const apiKeys =
        keysData?.data ?? [];

    if (clientLoading) {
        return (
            <div className={styles.pageContainer}>
                <CardGridSkeleton count={4} />
            </div>
        );
    }

    if (clientError) {
        return (
            <div className={styles.pageContainer}>
                <EmptyState
                    title="Failed to load client"
                    description="Unable to fetch client information."
                />
            </div>
        );
    }

    const overviewTab = (
        <div
            className={styles.pageContainer}
            style={{
                gap: '1.5rem',
                padding: 0,
            }}
        >
            <Card
                className={
                    styles.sectionCard
                }
            >
                <CardHeader>
                    <CardTitle>
                        Client Information
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div
                        className={
                            styles.gridTwoCols
                        }
                    >
                        <div>
                            <strong>
                                Company
                            </strong>
                            <p>
                                {
                                    client?.name
                                }
                            </p>
                        </div>

                        <div>
                            <strong>
                                Email
                            </strong>
                            <p>
                                {
                                    client?.email
                                }
                            </p>
                        </div>

                        <div>
                            <strong>
                                Slug
                            </strong>
                            <p>
                                {
                                    client?.slug
                                }
                            </p>
                        </div>

                        <div>
                            <strong>
                                Status
                            </strong>
                            <p>
                                <StatusBadge
                                    status={
                                        client?.isActive
                                            ? 'active'
                                            : 'disabled'
                                    }
                                />
                            </p>
                        </div>

                        <div>
                            <strong>
                                Website
                            </strong>
                            <p>
                                {client?.website ? (
                                    <a
                                        href={
                                            client.website
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {
                                            client.website
                                        }
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Created
                            </strong>
                            <p>
                                {client?.createdAt
                                    ? new Date(
                                          client.createdAt
                                      ).toLocaleDateString()
                                    : '—'}
                            </p>
                        </div>

                        <div
                            style={{
                                gridColumn:
                                    '1 / -1',
                            }}
                        >
                            <strong>
                                Description
                            </strong>

                            <p>
                                {client?.description ||
                                    'No description available'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {stats && (
                <div
                    style={{
                        display:
                            'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <StatCard
                        label="Total Requests"
                        value={
                            stats.totalHits?.toLocaleString() ??
                            '0'
                        }
                        icon={
                            BarChart3
                        }
                    />

                    <StatCard
                        label="Success Rate"
                        value={`${(
                            100 -
                            (stats.errorRate ??
                                0)
                        ).toFixed(1)}%`}
                        icon={
                            Activity
                        }
                    />

                    <StatCard
                        label="Avg Latency"
                        value={`${stats.avgLatency ?? 0}ms`}
                        icon={
                            Activity
                        }
                    />

                    <StatCard
                        label="API Keys"
                        value={
                            apiKeys.length
                        }
                        icon={Key}
                    />
                </div>
            )}
        </div>
    );

    const usersTab =
    usersLoading ? (
        <CardGridSkeleton count={2} />
    ) : users.length === 0 ? (
        <EmptyState
            title="No users found"
            description="Invite users to access this client."
            actionLabel="Invite User"
            onAction={() =>
                navigate(
                    `/admin/clients/${id}/users/create`
                )
            }
        />
    ) : (
        <Card className={styles.sectionCard}>
            <CardHeader>
                <CardTitle>
                    Client Users
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div
                    style={{
                        display: 'flex',
                        flexDirection:
                            'column',
                        gap: '1rem',
                    }}
                >
                    {users.map(
                        (user) => (
                            <div
                                key={
                                    user._id
                                }
                                style={{
                                    padding:
                                        '1rem',
                                    border:
                                        '1px solid hsl(var(--border))',
                                    borderRadius:
                                        '12px',
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                }}
                            >
                                <div>
                                    <h4>
                                        {
                                            user.username
                                        }
                                    </h4>

                                    <p>
                                        {
                                            user.email
                                        }
                                    </p>
                                </div>

                                <StatusBadge
                                    status={
                                        user.role
                                    }
                                />
                            </div>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const apiKeysTab =
        keysLoading ? (
            <CardGridSkeleton
                count={2}
            />
        ) : apiKeys.length === 0 ? (
            <EmptyState
                title="No API keys"
                description="Create an API key for this client to start monitoring."
                actionLabel="Create Key"
                onAction={() =>
                    navigate(
                        `/admin/clients/${id}/api-keys`
                    )
                }
            />
        ) : (
            <div
                style={{
                    display:
                        'flex',
                    flexDirection:
                        'column',
                    gap: '0.75rem',
                }}
            >
                {apiKeys.map(
                    (key) => (
                        <ApiKeyCard
                            key={
                                key._id ??
                                key.keyId
                            }
                            apiKey={
                                key
                            }
                        />
                    )
                )}

                <Button
                    variant="outline"
                    onClick={() =>
                        navigate(
                            `/admin/clients/${id}/api-keys`
                        )
                    }
                >
                    Manage API
                    Keys
                </Button>
            </div>
        );

    const activityTab = (
        <ActivityTimeline
            events={[
                {
                    title:
                        'Client onboarded',
                    timestamp:
                        client?.createdAt,
                    user: 'System',
                },

                ...topEndpoints
                    .slice(
                        0,
                        5
                    )
                    .map(
                        (
                            ep
                        ) => ({
                            title: `${ep.method} ${ep.endpoint}`,
                            timestamp:
                                new Date().toISOString(),
                            detail: `${ep.totalHits} hits`,
                        })
                    ),
            ]}
        />
    );

    const analyticsTab =
        stats ? (
            <div
                className={
                    styles.gridTwoCols
                }
            >
                <ApiHitsChart
                    stats={
                        stats
                    }
                />

                <StatusDistributionChart
                    data={{
                        labels:
                            [
                                'Success',
                                'Errors',
                            ],
                        values:
                            [
                                stats.successHits,
                                stats.errorHits,
                            ],
                    }}
                />
            </div>
        ) : (
            <EmptyState
                title="No analytics data"
                description="Analytics will appear once API traffic is recorded."
            />
        );

    return (
        <div
            className={
                styles.pageContainer
            }
        >
            <MetaTags
                title="Client Details - ObserveX"
                description="View organization details, API keys, active client users, performance analytics and audit logs."
            />
            <PageHeader
                title={
                    client?.name ??
                    'Client Details'
                }
                description={
                    client?.email ??
                    `Client ID: ${id}`
                }
                breadcrumbs={[
                    {
                        label: 'Home',
                        href: '/client/dashboard',
                    },
                    {
                        label: 'Clients',
                        href: '/admin/clients',
                    },
                    {
                        label:
                            client?.name ??
                            'Details',
                    },
                ]}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    `/admin/clients/${id}/users/create`
                                )
                            }
                        >
                            <Users
                                size={
                                    16
                                }
                            />
                            Invite User
                        </Button>

                        <Button
                            onClick={() =>
                                navigate(
                                    `/admin/clients/${id}/api-keys`
                                )
                            }
                        >
                            <Key
                                size={
                                    16
                                }
                            />
                            API Keys
                        </Button>
                    </>
                }
            />

            <Tabs
                tabs={[
                    {
                        id: 'overview',
                        label:
                            'Overview',
                        content:
                            overviewTab,
                    },
                    {
                        id: 'users',
                        label:
                            'Users',
                        content:
                            usersTab,
                    },
                    {
                        id: 'api-keys',
                        label:
                            'API Keys',
                        content:
                            apiKeysTab,
                    },
                    {
                        id: 'activity',
                        label:
                            'Activity',
                        content:
                            activityTab,
                    },
                    {
                        id: 'analytics',
                        label:
                            'Analytics',
                        content:
                            analyticsTab,
                    },
                ]}
            />
        </div>
    );
}