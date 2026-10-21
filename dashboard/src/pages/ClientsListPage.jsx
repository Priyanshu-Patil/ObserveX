import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
    Building2,
    CheckCircle2,
    AlertCircle,
    Globe,
    ExternalLink,
    Calendar,
} from 'lucide-react';

import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { DeleteClientModal } from '../components/ui/DeleteClientModal';

import { useDebounce } from '../hooks/useDebounce';
import { clientApi } from '../api/api';
import MetaTags from '../components/MetaTags';
import styles from '../styles/modules/pages/ClientsListPage.module.scss';

export function ClientsListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [clientToDelete, setClientToDelete] = useState(null);

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
        const q = debouncedSearch.toLowerCase().trim();
        return clients.filter((client) => {
            return (
                !q ||
                client.name?.toLowerCase().includes(q) ||
                client.slug?.toLowerCase().includes(q) ||
                client.email?.toLowerCase().includes(q) ||
                client.website?.toLowerCase().includes(q)
            );
        });
    }, [clients, debouncedSearch]);

    const activeCount = useMemo(
        () => clients.filter((c) => c.isActive).length,
        [clients]
    );
    const disabledCount = useMemo(
        () => clients.filter((c) => !c.isActive).length,
        [clients]
    );

    const columns = [
        {
            key: 'name',
            header: 'Company Name',
            render: (row) => (
                <Link
                    to={`/admin/clients/${row._id}`}
                    className={styles.clientNameLink}
                >
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (row) => row.email || '—',
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <span
                    className={
                        row.isActive
                            ? `${styles.statusPill} ${styles.statusActive}`
                            : `${styles.statusPill} ${styles.statusDisabled}`
                    }
                >
                    <span className={styles.statusDot} />
                    {row.isActive ? 'Active' : 'Disabled'}
                </span>
            ),
        },
        {
            key: 'website',
            header: 'Website',
            render: (row) => {
                if (!row.website) {
                    return <span className={styles.emptyVal}>—</span>;
                }
                const rawUrl = row.website.startsWith('http')
                    ? row.website
                    : `https://${row.website}`;
                const displayUrl = row.website
                    .replace(/^https?:\/\/(www\.)?/, '')
                    .replace(/\/$/, '');

                return (
                    <a
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.websiteLink}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Globe size={13} className={styles.websiteIcon} />
                        <span className={styles.websiteText}>{displayUrl}</span>
                        <ExternalLink size={11} className={styles.externalIcon} />
                    </a>
                );
            },
        },
        {
            key: 'createdAt',
            header: 'Created Date',
            sortValue: (row) => new Date(row.createdAt),
            render: (row) => (
                <div className={styles.dateCell}>
                    <Calendar size={13} className={styles.dateIcon} />
                    <span>
                        {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                              })
                            : '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (row) => (
                <div className={styles.actionsWrapper}>
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin/clients/${row._id}`)}
                        title="View Client Details"
                        aria-label="View Client Details"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin/clients/${row._id}`)}
                        title="Edit Client Settings"
                        aria-label="Edit Client Settings"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDestructive}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setClientToDelete(row);
                        }}
                        title={`Delete ${row.name} permanently`}
                        aria-label={`Delete ${row.name} permanently`}
                    >
                        <Trash2 size={14} />
                    </button>
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
                description="Manage client organizations, settings, API access, and user permissions across your infrastructure."
                canonical="/admin/clients"
                robots="noindex, nofollow"
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
                        onClick={() => navigate('/admin/clients/create')}
                        style={{ borderRadius: '0.75rem', gap: '0.45rem' }}
                    >
                        <Plus size={16} />
                        Create Client
                    </Button>
                }
            />

            {/* Quick Metrics Summary */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statTitle}>Total Clients</span>
                        <span className={styles.statValue}>{clients.length}</span>
                    </div>
                    <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
                        <Building2 size={20} />
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statTitle}>Active Clients</span>
                        <span className={styles.statValue}>{activeCount}</span>
                    </div>
                    <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statTitle}>Disabled Clients</span>
                        <span className={styles.statValue}>{disabledCount}</span>
                    </div>
                    <div className={`${styles.iconWrapper} ${styles.iconMuted}`}>
                        <AlertCircle size={20} />
                    </div>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className={styles.tableCard}>
                <div className={styles.toolbar}>
                    <div className={styles.searchWrap}>
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or domain..."
                        />
                    </div>
                    {search.trim() && (
                        <span className={styles.searchResultCount}>
                            {filtered.length} {filtered.length === 1 ? 'organization' : 'organizations'} found
                        </span>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={filtered}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    emptyTitle="No clients found"
                    emptyDescription="No client organizations match your current search criteria."
                />
            </div>

            <DeleteClientModal
                open={!!clientToDelete}
                client={clientToDelete}
                onClose={() => setClientToDelete(null)}
                onDeleted={() => {
                    queryClient.invalidateQueries({ queryKey: ['clients'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                    queryClient.invalidateQueries({ queryKey: ['stats'] });
                    setSelectedIds((prev) => prev.filter((id) => id !== clientToDelete?._id));
                }}
            />
        </div>
    );
}