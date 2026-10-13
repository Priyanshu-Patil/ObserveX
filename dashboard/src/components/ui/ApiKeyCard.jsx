import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CopyButton } from './CopyButton';
import { Button } from './Button';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function ApiKeyCard({ apiKey, keyValue, onRevoke, onRegenerate, showKey }) {
    const isRevoked = apiKey.isRevoked || apiKey.status === 'revoked' || apiKey.isActive === false;
    const [isRevealed, setIsRevealed] = useState(false);

    // Auto-mask after 20 seconds for defense-in-depth against shoulder surfing / inspect lingering
    useEffect(() => {
        if (!isRevealed) return;
        const timer = setTimeout(() => {
            setIsRevealed(false);
        }, 20000);
        return () => clearTimeout(timer);
    }, [isRevealed]);

    // Masked display: Keep prefix indicator but mask secret bytes with bullet characters in the DOM
    const maskedValue = keyValue
        ? (keyValue.startsWith('apim_') ? 'apim_' + '•'.repeat(28) : '•'.repeat(32))
        : '';

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
                <div
                    className={styles.secureKeyContainer}
                    onContextMenu={(e) => e.preventDefault()}
                    title="API key is masked to protect from browser inspection"
                >
                    <code
                        className={styles.secureKeyCode}
                        data-private="true"
                        style={{
                            userSelect: isRevealed ? 'all' : 'none',
                            letterSpacing: isRevealed ? 'normal' : '0.14em',
                        }}
                    >
                        {isRevealed ? keyValue : maskedValue}
                    </code>
                    <button
                        type="button"
                        className={styles.secureKeyToggle}
                        onClick={() => setIsRevealed(!isRevealed)}
                        title={isRevealed ? 'Hide API key' : 'Reveal API key (auto-hides in 20s)'}
                        aria-label={isRevealed ? 'Hide API key' : 'Reveal API key'}
                    >
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                    </button>
                    <CopyButton text={keyValue} label="Copy" />
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
