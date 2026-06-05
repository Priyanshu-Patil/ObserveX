import { Key } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CopyButton } from './CopyButton';
import { Button } from './Button';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function ApiKeyCard({ apiKey, keyValue, onRevoke, onRegenerate, showKey }) {
    const isRevoked = apiKey.isRevoked || apiKey.status === 'revoked';

    return (
        <div className={styles.apiKeyCard}>
            <div className={styles.apiKeyHeader}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Key size={18} style={{ marginTop: '0.125rem', color: 'hsl(var(--primary))' }} aria-hidden="true" />
                    <div>
                        <p className={styles.apiKeyName}>{apiKey.name}</p>
                        <p className={styles.apiKeyMeta}>
                            {apiKey.environment} · Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <StatusBadge status={isRevoked ? 'revoked' : 'active'} />
            </div>
            {showKey && keyValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem', background: 'hsl(var(--muted) / 0.5)', borderRadius: 'var(--radius)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{keyValue}</code>
                    <CopyButton text={keyValue} />
                </div>
            )}
            {apiKey.description && (
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: '0.5rem 0 0' }}>
                    {apiKey.description}
                </p>
            )}
            {!isRevoked && (onRevoke || onRegenerate) && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {onRegenerate && (
                        <Button variant="outline" size="sm" onClick={() => onRegenerate(apiKey)}>
                            Regenerate
                        </Button>
                    )}
                    {onRevoke && (
                        <Button variant="destructive" size="sm" onClick={() => onRevoke(apiKey)}>
                            Revoke
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
