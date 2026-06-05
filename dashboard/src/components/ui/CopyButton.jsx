import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function CopyButton({ text, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    const toast = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast('Copied to clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast('Failed to copy', 'error');
        }
    };

    return (
        <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label={label}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? 'Copied' : label}
        </button>
    );
}
