import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { clientApi } from '../api/api';
import { QUERY_KEYS, API_KEY_ENVIRONMENTS } from '../constants';
import { getRegisteredClient } from '../lib/clientRegistry';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/ConfirmationModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { FormField } from '../components/ui/FormField';
import { ApiKeyCard } from '../components/ui/ApiKeyCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function ApiKeysPage() {
    const { id } = useParams();
    const toast = useToast();
    const queryClient = useQueryClient();
    const client = getRegisteredClient(id);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [newKeyValue, setNewKeyValue] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', environment: 'production' });
    const debouncedSearch = useDebounce(search);

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.API_KEYS(id),
        queryFn: () => clientApi.getClientApiKeys(id),
        enabled: !!id,
    });

    const createMutation = useMutation({
        mutationFn: () => clientApi.createApiKey(id, form),
        onSuccess: (res) => {
            if (res.success) {
                setNewKeyValue(res.data?.keyValue);
                setCreateOpen(false);
                setForm({ name: '', description: '', environment: 'production' });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(id) });
                toast('API key created', 'success');
            }
        },
        onError: (err) => toast(err.response?.data?.message || 'Failed to create key', 'error'),
    });

    const apiKeys = (data?.data ?? []).filter((k) =>
        !debouncedSearch || k.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="API Keys"
                description={`Manage API keys for ${client?.name ?? 'client'}`}
                breadcrumbs={[
                    { label: 'Home', href: '/client/dashboard' },
                    { label: 'Clients', href: '/admin/clients' },
                    { label: client?.name ?? 'Client', href: `/admin/clients/${id}` },
                    { label: 'API Keys' },
                ]}
                actions={<Button onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Key</Button>}
            />
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keys..." />

            {newKeyValue && (
                <div style={{ padding: '1rem', border: '2px solid hsl(var(--primary))', borderRadius: 'var(--radius)', background: 'hsl(var(--primary) / 0.05)' }}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem' }}>⚠️ Copy your API key now — it won't be shown again</p>
                    <ApiKeyCard apiKey={{ name: form.name || 'New Key', environment: form.environment, createdAt: new Date().toISOString() }} keyValue={newKeyValue} showKey />
                    <Button variant="outline" size="sm" style={{ marginTop: '0.75rem' }} onClick={() => setNewKeyValue(null)}>I've copied the key</Button>
                </div>
            )}

            {isLoading ? <CardGridSkeleton count={3} /> : apiKeys.length === 0 ? (
                <EmptyState title="No API keys" description="Create an API key to start sending monitoring data." actionLabel="Create Key" onAction={() => setCreateOpen(true)} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {apiKeys.map((key) => (
                        <ApiKeyCard
                            key={key._id ?? key.keyId}
                            apiKey={key}
                            onRevoke={() => setRevokeTarget(key)}
                            onRegenerate={() => toast('Regenerate requires backend support', 'info')}
                        />
                    ))}
                </div>
            )}

            <Modal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create API Key"
                description="Generate a new API key for monitoring ingestion."
                footer={
                    <>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </>
                }
            >
                <div className={styles.formStack}>
                    <FormField label="Key Name" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                    <FormField label="Description" name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                    <FormField label="Environment" name="environment">
                        <select id="environment" value={form.environment} onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
                            {API_KEY_ENVIRONMENTS.map((env) => <option key={env.value} value={env.value}>{env.label}</option>)}
                        </select>
                    </FormField>
                </div>
            </Modal>

            <ConfirmationModal
                open={!!revokeTarget}
                onClose={() => setRevokeTarget(null)}
                onConfirm={() => {
                    toast('Revoke requires backend support', 'info');
                    setRevokeTarget(null);
                }}
                title="Revoke API Key"
                description={`Are you sure you want to revoke "${revokeTarget?.name}"? This action cannot be undone and will immediately stop all traffic using this key.`}
                confirmLabel="Revoke Key"
            />
        </div>
    );
}
