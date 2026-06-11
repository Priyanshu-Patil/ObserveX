import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Pencil } from 'lucide-react';

import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterPanel } from '../components/ui/FilterPanel';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';

import { useDebounce } from '../hooks/useDebounce';
import { clientApi } from '../api/api';

import styles from '../styles/modules/pages/PageComponents.module.scss';
import MetaTags from '../components/MetaTags';


export function ClientsListPage() {
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    const debouncedSearch = useDebounce(search);

    const {
        data: clientsResponse,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['clients'],
        queryFn: clientApi.getClients,
    });

    const clients = clientsResponse?.data || [];

    const filtered = useMemo(() => {
        return clients.filter((client) => {
            const q = debouncedSearch.toLowerCase();

            const matchesSearch =
                !q ||
                client.name?.toLowerCase().includes(q) ||
                client.email?.toLowerCase().includes(q);

            const clientStatus = client.isActive
                ? 'active'
                : 'disabled';

            const matchesStatus =
                statusFilter === 'all' ||
                clientStatus === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        clients,
        debouncedSearch,
        statusFilter,
    ]);

    const columns = [
        {
            key: 'name',
            header: 'Company Name',
            render: (row) => (
                <Link
                    to={`/admin/clients/${row._id}`}
                    style={{
                        fontWeight: 500,
                        color: 'hsl(var(--primary))',
                    }}
                >
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (row) => row.email,
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <StatusBadge
                    status={
                        row.isActive
                            ? 'active'
                            : 'disabled'
                    }
                />
            ),
        },
        {
            key: 'website',
            header: 'Website',
            render: (row) =>
                row.website ? (
                    <a
                        href={row.website}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {row.website}
                    </a>
                ) : (
                    '—'
                ),
        },
        {
            key: 'createdAt',
            header: 'Created Date',
            sortValue: (row) =>
                new Date(row.createdAt),

            render: (row) =>
                new Date(
                    row.createdAt
                ).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (row) => (
                <div
                    style={{
                        display: 'flex',
                        gap: '0.25rem',
                    }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            navigate(
                                `/admin/clients/${row._id}`
                            )
                        }
                        aria-label="View"
                    >
                        <Eye size={16} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            navigate(
                                `/admin/clients/${row._id}`
                            )
                        }
                        aria-label="Edit"
                    >
                        <Pencil size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <PageHeader
                    title="Clients"
                    description="Loading clients..."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageContainer}>
                <PageHeader
                    title="Clients"
                    description="Failed to load clients"
                />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <MetaTags
                title="Manage Clients - ObserveX"
                description="Manage client organizations, settings, API access, and user permissions."
            />
            <PageHeader
                title="Clients"
                description="Manage organizations and their access"
                breadcrumbs={[
                    {
                        label: 'Home',
                        href: '/client/dashboard',
                    },
                    {
                        label: 'Clients',
                    },
                ]}
                actions={
                    <Button
                        onClick={() =>
                            navigate(
                                '/admin/clients/create'
                            )
                        }
                    >
                        <Plus size={16} />
                        Create Client
                    </Button>
                }
            />

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                    justifyContent:
                        'space-between',
                }}
            >
                <SearchInput
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search clients..."
                />
            </div>

            <FilterPanel
                filters={[
                    {
                        id: 'status',
                        label: 'Status',
                        type: 'select',
                        value: statusFilter,
                        onChange:
                            setStatusFilter,
                        options: [
                            {
                                value: 'all',
                                label: 'All Statuses',
                            },
                            {
                                value: 'active',
                                label: 'Active',
                            },
                            {
                                value: 'disabled',
                                label: 'Disabled',
                            },
                        ],
                    },
                ]}
            />

            <DataTable
                columns={columns}
                data={filtered}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={
                    setSelectedIds
                }
                emptyTitle="No clients found"
                emptyDescription="Create your first client organization to get started, or adjust your search filters."
            />
        </div>
    );
}