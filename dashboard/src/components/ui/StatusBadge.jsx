import { Badge } from './Badge';

const STATUS_MAP = {
    active: 'success',
    enabled: 'success',
    production: 'default',
    staging: 'secondary',
    development: 'outline',
    testing: 'outline',
    inactive: 'secondary',
    disabled: 'secondary',
    revoked: 'destructive',
    expired: 'destructive',
    pending: 'secondary',
    enterprise: 'default',
    pro: 'default',
    starter: 'outline',
};

export function StatusBadge({ status, children }) {
    const normalized = String(status ?? children ?? '').toLowerCase();
    const variant = STATUS_MAP[normalized] ?? 'secondary';
    const label = children ?? status ?? 'Unknown';

    return <Badge variant={variant}>{label}</Badge>;
}
