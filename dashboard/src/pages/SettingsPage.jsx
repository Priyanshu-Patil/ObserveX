import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function SettingsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        systemAlerts: true,
        weeklyDigest: false,
    });

    const profileTab = (
        <Card className={styles.sectionCard}>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details from the server</CardDescription>
            </CardHeader>
            <CardContent className={styles.formStack}>
                <FormField label="Username" name="username" value={user?.username ?? ''} disabled readOnly />
                <FormField label="Email" name="email" value={user?.email ?? ''} disabled readOnly />
                <FormField label="Role" name="role">
                    <div style={{ paddingTop: '0.25rem' }}><StatusBadge status={user?.role}>{user?.role?.replace('_', ' ')}</StatusBadge></div>
                </FormField>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>Profile updates require backend API support.</p>
            </CardContent>
        </Card>
    );

    const securityTab = (
        <div className={styles.formStack}>
            <Card className={styles.sectionCard}>
                <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Update your account password</CardDescription></CardHeader>
                <CardContent className={styles.formStack}>
                    <FormField label="Current Password" name="currentPassword" type="password" disabled />
                    <FormField label="New Password" name="newPassword" type="password" disabled />
                    <Button disabled onClick={() => toast('Password change requires backend support', 'info')}>Update Password</Button>
                </CardContent>
            </Card>
            <Card className={styles.sectionCard}>
                <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
                <CardContent>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p>Current Session</p>
                            <p>{navigator.userAgent.slice(0, 60)}...</p>
                        </div>
                        <StatusBadge status="active">Active</StatusBadge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const notificationsTab = (
        <Card className={styles.sectionCard}>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className={styles.formStack}>
                {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications for critical events' },
                    { key: 'systemAlerts', label: 'System Alerts', desc: 'In-app notifications for system events' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of API performance each week' },
                ].map((item) => (
                    <div key={item.key} className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <p>{item.label}</p>
                            <p>{item.desc}</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications[item.key]}
                            onChange={(e) => {
                                setNotifications((n) => ({ ...n, [item.key]: e.target.checked }));
                                toast('Preference saved locally', 'success');
                            }}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    const appearanceTab = (
        <Card className={styles.sectionCard}>
            <CardHeader>
                <div className={styles.cardTitleRow}>
                    <Palette className={styles.cardTitleIcon} aria-hidden="true" />
                    <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent><ThemeSelector /></CardContent>
        </Card>
    );

    const organizationTab = (
        <Card className={styles.sectionCard}>
            <CardHeader><CardTitle>Organization</CardTitle><CardDescription>Company details for your organization</CardDescription></CardHeader>
            <CardContent className={styles.formStack}>
                <FormField label="Client ID" name="clientId" value={user?.clientId ?? 'N/A (Super Admin)'} disabled readOnly />
                <FormField label="Account Status" name="status">
                    <div style={{ paddingTop: '0.25rem' }}><StatusBadge status={user?.isActive ? 'active' : 'disabled'}>{user?.isActive ? 'Active' : 'Inactive'}</StatusBadge></div>
                </FormField>
            </CardContent>
        </Card>
    );

    return (
        <div className={styles.pageContainer}>
            <PageHeader title="Settings" description="Manage your account and preferences" breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Settings' }]} />
            <Tabs tabs={[
                { id: 'profile', label: 'Profile', content: profileTab },
                { id: 'security', label: 'Security', content: securityTab },
                { id: 'notifications', label: 'Notifications', content: notificationsTab },
                { id: 'appearance', label: 'Appearance', content: appearanceTab },
                { id: 'organization', label: 'Organization', content: organizationTab },
            ]} />
        </div>
    );
}
