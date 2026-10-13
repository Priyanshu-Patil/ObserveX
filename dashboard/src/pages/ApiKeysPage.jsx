import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { clientApi } from '../api/api';
import { QUERY_KEYS, API_KEY_ENVIRONMENTS } from '../constants';
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
import MetaTags from '../components/MetaTags';


export function ApiKeysPage() {
    const { id } = useParams();
    const toast = useToast();
    const queryClient = useQueryClient();
    const {
        data: clientResponse,
        isLoading: clientLoading,
    } = useQuery({
        queryKey: ['client', id],
        queryFn: () => clientApi.getClient(id),
        enabled: !!id,
    });
    
    const client = clientResponse?.data;
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [regenerateTarget, setRegenerateTarget] = useState(null);
    const [revealedKeyData, setRevealedKeyData] = useState(null);
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
                setRevealedKeyData({
                    name: form.name || 'New Key',
                    environment: form.environment,
                    createdAt: res.data?.createdAt || new Date().toISOString(),
                    keyValue: res.data?.keyValue,
                });
                setCreateOpen(false);
                setForm({ name: '', description: '', environment: 'production' });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(id) });
                toast('API key created', 'success');
            }
        },
        onError: (err) => toast(err.response?.data?.message || 'Failed to create key', 'error'),
    });

    const regenerateMutation = useMutation({
        mutationFn: (targetKey) => {
            const keyId = targetKey._id ?? targetKey.keyId;
            return clientApi.regenerateApiKey(id, keyId);
        },
        onSuccess: (res, targetKey) => {
            if (res.success) {
                setRevealedKeyData({
                    name: targetKey.name || res.data?.name || 'Regenerated Key',
                    environment: targetKey.environment || res.data?.environment,
                    createdAt: res.data?.createdAt || new Date().toISOString(),
                    keyValue: res.data?.keyValue,
                });
                setRegenerateTarget(null);
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(id) });
                toast('API key regenerated successfully', 'success');
            }
        },
        onError: (err) => {
            toast(err.response?.data?.message || 'Failed to regenerate key', 'error');
            setRegenerateTarget(null);
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (targetKey) => {
            const keyId = targetKey._id ?? targetKey.keyId;
            return clientApi.revokeApiKey(id, keyId);
        },
        onSuccess: (res) => {
            if (res.success) {
                setRevokeTarget(null);
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(id) });
                toast('API key revoked successfully', 'success');
            }
        },
        onError: (err) => {
            toast(err.response?.data?.message || 'Failed to revoke key', 'error');
            setRevokeTarget(null);
        },
    });

    const apiKeys = (data?.data ?? []).filter((k) =>
        !debouncedSearch || k.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // Auto-clear newly created or regenerated API key from browser memory after 60 seconds
    useEffect(() => {
        if (!revealedKeyData) return;
        const timer = setTimeout(() => {
            setRevealedKeyData(null);
            toast('API key display session ended. Key is securely hidden.', 'info');
        }, 60000);
        return () => clearTimeout(timer);
    }, [revealedKeyData]);

    if (clientLoading) {
        return (
            <div className={styles.pageContainer}>
                <CardGridSkeleton count={3} />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <MetaTags
                title="API Key Management - ObserveX"
                description="Create, view, rotate and revoke secure API keys used for real-time metric ingestion."
            />
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

            {revealedKeyData && (
                <div style={{ padding: '1rem', border: '2px solid hsl(var(--primary))', borderRadius: 'var(--radius)', background: 'hsl(var(--primary) / 0.05)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <p style={{ fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={18} style={{ color: 'hsl(var(--primary))' }} />
                            Copy your API key now — it won't be shown again
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            🔒 Masked in DOM to protect against browser inspection
                        </span>
                    </div>
                    <ApiKeyCard apiKey={revealedKeyData} keyValue={revealedKeyData.keyValue} showKey />
                    <Button variant="outline" size="sm" style={{ marginTop: '0.75rem' }} onClick={() => setRevealedKeyData(null)}>I've copied the key</Button>
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
                            onRegenerate={() => setRegenerateTarget(key)}
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
                        <select id="environment" value={form.environment} onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))} className={styles.select}>
                            {API_KEY_ENVIRONMENTS.map((env) => <option key={env.value} value={env.value}>{env.label}</option>)}
                        </select>
                    </FormField>
                </div>
            </Modal>

            <ConfirmationModal
                open={!!regenerateTarget}
                onClose={() => setRegenerateTarget(null)}
                onConfirm={() => {
                    if (regenerateTarget) {
                        regenerateMutation.mutate(regenerateTarget);
                    }
                }}
                title="Regenerate API Key"
                description={`Are you sure you want to regenerate "${regenerateTarget?.name}"? The current key will immediately stop working and any applications using it will need to be updated with the new key.`}
                confirmLabel="Regenerate Key"
                variant="default"
                isLoading={regenerateMutation.isPending}
            />

            <ConfirmationModal
                open={!!revokeTarget}
                onClose={() => setRevokeTarget(null)}
                onConfirm={() => {
                    if (revokeTarget) {
                        revokeMutation.mutate(revokeTarget);
                    }
                }}
                title="Revoke API Key"
                description={`Are you sure you want to revoke "${revokeTarget?.name}"? This action cannot be undone and will immediately stop all traffic using this key.`}
                confirmLabel="Revoke Key"
                variant="destructive"
                isLoading={revokeMutation.isPending}
            />
        </div>
    );
}
