import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterPanel } from '../components/ui/FilterPanel';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { getRegisteredClients } from '../lib/clientRegistry';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function ClientsListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const debouncedSearch = useDebounce(search);

    const clients = useMemo(() => getRegisteredClients(), []);

    const filtered = useMemo(() => {
        return clients.filter((c) => {
            const q = debouncedSearch.toLowerCase();
            const matchSearch = !q || (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
            const matchStatus = statusFilter === 'all' || (c.status ?? 'active') === statusFilter;
            const matchPlan = planFilter === 'all' || (c.plan ?? 'starter') === planFilter;
            return matchSearch && matchStatus && matchPlan;
        });
    }, [clients, debouncedSearch, statusFilter, planFilter]);

    const columns = [
        {
            key: 'name',
            header: 'Company Name',
            render: (row) => (
                <Link to={`/admin/clients/${row._id}`} style={{ fontWeight: 500, color: 'hsl(var(--primary))' }}>
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status ?? 'active'} />,
        },
        { key: 'totalUsers', header: 'Total Users', render: (row) => row.totalUsers ?? 0 },
        { key: 'apiKeys', header: 'API Keys', render: (row) => row.apiKeyCount ?? 0 },
        {
            key: 'createdAt',
            header: 'Created Date',
            sortValue: (row) => new Date(row.createdAt ?? row.registeredAt),
            render: (row) => new Date(row.createdAt ?? row.registeredAt).toLocaleDateString(),
        },
        {
            key: 'lastActivity',
            header: 'Last Activity',
            render: (row) => row.lastActivity ? new Date(row.lastActivity).toLocaleDateString() : '—',
        },
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/clients/${row._id}`)} aria-label="View">
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/clients/${row._id}`)} aria-label="Edit">
                        <Pencil size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="Clients"
                description="Manage organizations and their access"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Clients' }]}
                actions={
                    <Button onClick={() => navigate('/admin/clients/create')}>
                        <Plus size={16} /> Create Client
                    </Button>
                }
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." />
            </div>
            <FilterPanel filters={[
                { id: 'status', label: 'Status', type: 'select', value: statusFilter, onChange: setStatusFilter, options: [
                    { value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' },
                ]},
                { id: 'plan', label: 'Plan', type: 'select', value: planFilter, onChange: setPlanFilter, options: [
                    { value: 'all', label: 'All Plans' }, { value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' },
                ]},
            ]} />
            <DataTable
                columns={columns}
                data={filtered}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                emptyTitle="No clients found"
                emptyDescription="Create your first client organization to get started, or adjust your search filters."
            />
        </div>
    );
}
