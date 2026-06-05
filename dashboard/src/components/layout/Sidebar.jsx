import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Settings,
    BarChart3,
    LineChart,
    Building2,
    Users,
    Key,
    ScrollText,
    BookOpen,
    Plus,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from '../../styles/modules/layout/Sidebar.module.scss';

function NavSection({ title, items, onClose }) {
    return (
        <div className={styles.navSection}>
            {title && <p className={styles.sectionTitle}>{title}</p>}
            <div className={styles.navList}>
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(styles.navLink, isActive && styles.active)
                            }
                        >
                            <Icon aria-hidden="true" />
                            <div className={styles.navItem}>
                                <div>{item.title}</div>
                            </div>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
}

export function Sidebar({ isOpen, onClose }) {
    const { currentTheme } = useTheme();
    const { isSuperAdmin, clientId } = useAuth();
    const logoSrc = currentTheme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png';

    const dashboardItems = [
        { title: 'Overview', href: '/client/dashboard', icon: LayoutDashboard, end: true },
    ];

    const analyticsItems = [
        { title: 'Overview', href: '/analytics', icon: BarChart3, end: true },
        { title: 'Endpoint Analytics', href: '/analytics/endpoints', icon: LineChart, end: true },
    ];

    const adminItems = isSuperAdmin ? [
        { title: 'All Clients', href: '/admin/clients', icon: Building2, end: true },
        { title: 'Create Client', href: '/admin/clients/create', icon: Plus, end: true },
    ] : [];

    const apiKeysHref = isSuperAdmin
        ? '/admin/clients'
        : (clientId ? `/admin/clients/${clientId}/api-keys` : '/settings');

    const bottomItems = [
        { title: 'API Keys', href: apiKeysHref, icon: Key, end: true },
        { title: 'Activity Logs', href: '/activity', icon: ScrollText, end: true },
        { title: 'Documentation', href: '/docs', icon: BookOpen, end: true },
        { title: 'Settings', href: '/settings', icon: Settings, end: true },
    ];

    return (
        <>
            {isOpen && (
                <div className={styles.mobileOverlay} onClick={onClose} aria-hidden="true" />
            )}
            <aside
                className={cn(styles.sidebar, !isOpen && styles.closed)}
                aria-label="Sidebar"
                aria-expanded={isOpen}
            >
                <div className={styles.sidebarContainer}>
                    <div className={styles.logoSection}>
                        <div className={styles.logoIcon}>
                            <img src={logoSrc} alt="ObserveX logo" className={styles.logoImage} />
                        </div>
                    </div>

                    <nav className={styles.navigation} aria-label="Main navigation">
                        <NavSection title="Dashboard" items={dashboardItems} onClose={onClose} />
                        <NavSection title="Analytics" items={analyticsItems} onClose={onClose} />
                        {isSuperAdmin && adminItems.length > 0 && (
                            <NavSection title="Clients" items={adminItems} onClose={onClose} />
                        )}
                        {isSuperAdmin && (
                            <NavSection title="Users" items={[
                                { title: 'Register User', href: '/register', icon: Users, end: true },
                            ]} onClose={onClose} />
                        )}
                    </nav>

                    <div className={styles.bottomNavigation}>
                        <NavSection items={bottomItems} onClose={onClose} />
                    </div>
                </div>
            </aside>
        </>
    );
}
