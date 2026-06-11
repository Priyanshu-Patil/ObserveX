import { useState } from 'react';
import { 
  User, Lock, Bell, Palette, Building2, 
  Chrome, Laptop 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/modules/pages/SettingsPage.module.scss';
import MetaTags from '../components/MetaTags';


const SIDEBAR_TABS = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'security', label: 'Security & Sessions', icon: Lock },
  { id: 'notifications', label: 'Notification Settings', icon: Bell },
  { id: 'appearance', label: 'Appearance Theme', icon: Palette },
  { id: 'organization', label: 'Organization details', icon: Building2 },
];

export function SettingsPage() {
    const { user, clientId } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        systemAlerts: true,
        weeklyDigest: false,
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><User size={20} /> Profile Information</h3>
                            <p className={styles.cardDescription}>View and manage your account credentials</p>
                        </div>
                        <div className={styles.profileAvatarCard}>
                            <div className={styles.avatarCircle}>
                                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className={styles.avatarMeta}>
                                <h4 className={styles.avatarName}>{user?.username ?? 'Account User'}</h4>
                                <span className={styles.avatarRole}>{user?.role?.replace('_', ' ') ?? 'User'}</span>
                            </div>
                        </div>
                        <div className={styles.formGrid}>
                            <FormField label="Username" name="username" value={user?.username ?? ''} disabled readOnly />
                            <FormField label="Email" name="email" value={user?.email ?? ''} disabled readOnly />
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Account Role Privilege</span>
                            <div style={{ paddingTop: '0.35rem' }}>
                                <StatusBadge status={user?.role}>{user?.role?.replace('_', ' ')}</StatusBadge>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                            Profile modifications are managed by your administrator and require API client synchronization.
                        </p>
                    </div>
                );
            case 'security':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className={styles.sectionCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}><Lock size={20} /> Credentials Security</h3>
                                <p className={styles.cardDescription}>Configure your account security configurations</p>
                            </div>
                            <div className={styles.formGrid}>
                                <FormField label="Current Password" name="currentPassword" type="password" placeholder="••••••••" disabled />
                                <FormField label="New Password" name="newPassword" type="password" placeholder="••••••••" disabled />
                            </div>
                            <div>
                                <Button disabled onClick={() => toast('Password updates require security server support', 'info')} style={{ borderRadius: '0.75rem' }}>
                                    Update Password
                                </Button>
                            </div>
                        </div>
                        
                        <div className={styles.sectionCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}><Laptop size={20} /> Active Sessions</h3>
                                <p className={styles.cardDescription}>Devices that are currently authenticated into this client dashboard</p>
                            </div>
                            <div className={styles.sessionItem}>
                                <div className={styles.sessionDetails}>
                                    <Chrome />
                                    <div className={styles.sessionInfo}>
                                        <p>Current Browser Session</p>
                                        <p>{navigator.userAgent.slice(0, 70)}...</p>
                                    </div>
                                </div>
                                <StatusBadge status="active">Active Now</StatusBadge>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Bell size={20} /> Notification Preferences</h3>
                            <p className={styles.cardDescription}>Manage the alert notifications you receive for your API services</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[
                                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Send emails to account coordinators during high endpoint error rates' },
                                { key: 'systemAlerts', label: 'System Alerts', desc: 'Display in-app system message alerts in dashboard layout' },
                                { key: 'weeklyDigest', label: 'Weekly Performance Digest', desc: 'Email a weekly summary report of service latencies and hits' },
                            ].map((item) => (
                                <div key={item.key} className={styles.settingRow}>
                                    <div className={styles.settingInfo}>
                                        <p>{item.label}</p>
                                        <p>{item.desc}</p>
                                    </div>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={notifications[item.key]}
                                            onChange={(e) => {
                                                setNotifications((n) => ({ ...n, [item.key]: e.target.checked }));
                                                toast('Preference saved locally', 'success');
                                            }}
                                        />
                                        <span className={styles.slider} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Palette size={20} /> Visual Appearance</h3>
                            <p className={styles.cardDescription}>Customize client colors and system color themes</p>
                        </div>
                        <div>
                            <ThemeSelector />
                        </div>
                    </div>
                );
            case 'organization':
                return (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Building2 size={20} /> Organization Account</h3>
                            <p className={styles.cardDescription}>Your company system workspace details</p>
                        </div>
                        <div className={styles.formGrid}>
                            <FormField label="Client ID Workspace" name="clientId" value={clientId ?? 'N/A (ObserveX Super Admin)'} disabled readOnly />
                            <FormField label="Account Workspace Status" name="status">
                                <div style={{ paddingTop: '0.25rem' }}>
                                    <StatusBadge status={user?.isActive ? 'active' : 'disabled'}>
                                        {user?.isActive ? 'Active Workspace' : 'Inactive Workspace'}
                                    </StatusBadge>
                                </div>
                            </FormField>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <MetaTags
                title="System Settings - ObserveX"
                description="Manage your ObserveX account credentials, notification settings, visual appearance theme, and organization details."
            />
            <PageHeader 
                title="Settings" 
                description="Manage your account, security keys, alerts and visual theme preference" 
                breadcrumbs={[{ label: 'Home', href: '/client/dashboard' }, { label: 'Settings' }]} 
            />
            <div className={styles.settingsLayout}>
                <aside className={styles.settingsSidebar}>
                    {SIDEBAR_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={`${styles.sidebarBtn} ${isActive ? styles.activeSidebarBtn : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </aside>
                <main className={styles.settingsContent}>
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
}
