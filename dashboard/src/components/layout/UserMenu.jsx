import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/modules/layout/UserMenu.module.scss';

export function UserMenu({ onLogout }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const initials = (user?.username ?? user?.email ?? 'U').slice(0, 2).toUpperCase();

    return (
        <div className={styles.menu} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.name}>{user?.username ?? 'User'}</span>
                <ChevronDown size={16} aria-hidden="true" />
            </button>
            {open && (
                <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{user?.username}</p>
                        <p className={styles.dropdownEmail}>{user?.email}</p>
                        <span className={styles.roleBadge}>{user?.role?.replace('_', ' ')}</span>
                    </div>
                    <Link to="/settings" className={styles.dropdownItem} role="menuitem" onClick={() => setOpen(false)}>
                        <Settings size={16} aria-hidden="true" /> Settings
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem} role="menuitem" onClick={() => setOpen(false)}>
                        <User size={16} aria-hidden="true" /> Profile
                    </Link>
                    <button type="button" className={styles.dropdownItem} role="menuitem" onClick={() => { setOpen(false); onLogout?.(); }}>
                        <LogOut size={16} aria-hidden="true" /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}
