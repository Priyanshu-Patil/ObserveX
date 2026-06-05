import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Loader2 } from 'lucide-react';
import { clientApi } from '../api/api';
import { registerClient } from '../lib/clientRegistry';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { isValidEmail } from '../lib/validation';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/PageComponents.module.scss';

const DRAFT_KEY = 'observex_client_draft';

export function CreateClientPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState(() => {
        try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) ?? getDefaultForm(); }
        catch { return getDefaultForm(); }
    });
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [success, setSuccess] = useState(null);

    function getDefaultForm() {
        return { name: '', industry: '', contactName: '', email: '', phone: '', plan: 'starter', status: 'active', notes: '', website: '' };
    }

    useEffect(() => {
        if (isDirty) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        }
    }, [form, isDirty]);

    useEffect(() => {
        const handler = (e) => {
            if (isDirty && !success) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty, success]);

    const mutation = useMutation({
        mutationFn: () => clientApi.onboardClient({
            name: form.name,
            email: form.email,
            description: [form.notes, form.industry && `Industry: ${form.industry}`, form.contactName && `Contact: ${form.contactName}`, form.phone && `Phone: ${form.phone}`].filter(Boolean).join('\n'),
            website: form.website || undefined,
        }),
        onSuccess: (data) => {
            if (data.success) {
                registerClient(data.data, { industry: form.industry, contactName: form.contactName, phone: form.phone, plan: form.plan, status: form.status });
                localStorage.removeItem(DRAFT_KEY);
                setSuccess(data.data);
                toast('Client created successfully', 'success');
            } else {
                toast(data.message, 'error');
            }
        },
        onError: (err) => toast(err.response?.data?.message || 'Failed to create client', 'error'),
    });

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Company name is required';
        if (!form.email.trim()) next.email = 'Email is required';
        else if (!isValidEmail(form.email)) next.email = 'Enter a valid email';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) mutation.mutate();
    };

    const update = (field) => (e) => {
        setIsDirty(true);
        setForm((f) => ({ ...f, [field]: e.target.value }));
    };

    if (success) {
        return (
            <div className={styles.pageContainer}>
                <Card className={styles.sectionCard}>
                    <CardContent style={{ textAlign: 'center', padding: '3rem' }}>
                        <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                        <h2>Client Created Successfully</h2>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>{success.name} has been onboarded.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <Button onClick={() => navigate(`/admin/clients/${success._id}`)}>View Client</Button>
                            <Button variant="outline" onClick={() => navigate('/admin/clients')}>Back to Clients</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title="Create Client"
                description="Onboard a new organization"
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Clients', href: '/admin/clients' }, { label: 'Create' }]}
            />
            <Card className={styles.sectionCard}>
                <CardContent>
                    <form onSubmit={handleSubmit} className={styles.formStack}>
                        <div className={styles.gridTwoCols}>
                            <FormField label="Company Name" name="name" value={form.name} onChange={update('name')} error={errors.name} required />
                            <FormField label="Industry" name="industry" value={form.industry} onChange={update('industry')} />
                            <FormField label="Contact Name" name="contactName" value={form.contactName} onChange={update('contactName')} />
                            <FormField label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} required />
                            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={update('phone')} />
                            <FormField label="Website" name="website" value={form.website} onChange={update('website')} />
                            <FormField label="Plan" name="plan" error={errors.plan}>
                                <select id="plan" value={form.plan} onChange={update('plan')} className={styles.formLabel} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </FormField>
                            <FormField label="Status" name="status">
                                <select id="status" value={form.status} onChange={update('status')} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
                                    <option value="active">Active</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </FormField>
                        </div>
                        <FormField label="Notes" name="notes">
                            <textarea id="notes" value={form.notes} onChange={update('notes')} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                        </FormField>
                        <div className={styles.actionRow}>
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/clients')}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <><Loader2 className={styles.iconSm} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : 'Create Client'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
