import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    Trash2,
    Loader2,
    Database,
    Key,
    Users,
    BarChart3,
    FileText,
} from 'lucide-react';
import { Button } from './Button';
import { Portal } from './Portal';
import { clientApi } from '../../api/api';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/modules/ui/DeleteClientModal.module.scss';

export function DeleteClientModal({
    open,
    onClose,
    client,
    onDeleted,
}) {
    const addToast = useToast();
    const [typedName, setTypedName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (open) {
            setTypedName('');
            setIsDeleting(false);
            setErrorMessage('');
        }
    }, [open, client]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isDeleting) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, isDeleting, onClose]);

    if (!open || !client) return null;

    const expectedName = client.name || '';
    const isMatched = typedName.trim().toLowerCase() === expectedName.trim().toLowerCase();
    const isButtonDisabled = !isMatched || isDeleting;

    const handleDelete = async () => {
        if (isButtonDisabled) return;
        setIsDeleting(true);
        setErrorMessage('');

        try {
            const response = await clientApi.deleteClient(client._id);
            addToast(`Client "${client.name}" and all associated resources permanently deleted`, 'success');
            if (onDeleted) {
                onDeleted(response);
            }
            onClose();
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.message || 'Failed to delete client';
            setErrorMessage(apiMessage);
            addToast(apiMessage, 'error');
            setIsDeleting(false);
        }
    };

    return (
        <Portal>
            <div
                className={styles.modalOverlay}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-client-title"
                aria-describedby="delete-client-desc"
                onClick={() => {
                    if (!isDeleting) onClose();
                }}
            >
                <div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.topAccentBar} />

                    <div className={styles.modalHeader}>
                        <div className={styles.dangerIconWrapper} aria-hidden="true">
                            <AlertTriangle size={22} />
                        </div>
                        <div className={styles.headerContent}>
                            <h2 id="delete-client-title" className={styles.modalTitle}>
                                Delete Client Permanently?
                            </h2>
                            <p id="delete-client-desc" className={styles.modalDescription}>
                                You are about to permanently delete this client and its associated data. This action cannot be undone. All resources owned exclusively by this client will be deleted.
                            </p>
                        </div>
                    </div>

                    <div className={styles.modalBody}>
                        {/* Target Organization Details */}
                        <div className={styles.clientTargetCard}>
                            <div className={styles.clientTargetRow}>
                                <span className={styles.targetLabel}>Target Organization</span>
                                <span className={styles.targetValue}>{client.name}</span>
                            </div>
                            <div className={styles.clientTargetRow}>
                                <span className={styles.targetLabel}>Client Identifier</span>
                                <span className={styles.targetCode}>{client._id}</span>
                            </div>
                            {client.slug && (
                                <div className={styles.clientTargetRow}>
                                    <span className={styles.targetLabel}>Slug</span>
                                    <span className={styles.targetValue}>{client.slug}</span>
                                </div>
                            )}
                        </div>

                        {/* Verified Resources to be cleaned up */}
                        <div className={styles.resourcesSection}>
                            <span className={styles.resourcesHeading}>Resources that will be permanently deleted:</span>
                            <ul className={styles.resourcesList}>
                                <li className={styles.resourceItem}>
                                    <FileText size={14} aria-hidden="true" />
                                    <span>Organization record & settings</span>
                                </li>
                                <li className={styles.resourceItem}>
                                    <Users size={14} aria-hidden="true" />
                                    <span>Client users & credentials</span>
                                </li>
                                <li className={styles.resourceItem}>
                                    <Key size={14} aria-hidden="true" />
                                    <span>API keys & ingest tokens</span>
                                </li>
                                <li className={styles.resourceItem}>
                                    <Database size={14} aria-hidden="true" />
                                    <span>Raw API hit history</span>
                                </li>
                                <li className={styles.resourceItem}>
                                    <BarChart3 size={14} aria-hidden="true" />
                                    <span>Aggregated metrics</span>
                                </li>
                            </ul>
                        </div>

                        {/* Typing confirmation requirement */}
                        <div className={styles.confirmationInputSection}>
                            <label htmlFor="confirm-client-name" className={styles.confirmationPrompt}>
                                To confirm, type <strong>{client.name}</strong> in the field below:
                            </label>
                            <input
                                id="confirm-client-name"
                                type="text"
                                className={styles.confirmInput}
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder={client.name}
                                disabled={isDeleting}
                                autoFocus
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>

                        {errorMessage && (
                            <div className={styles.errorBanner} role="alert">
                                <strong>Deletion error:</strong> {errorMessage}
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isButtonDisabled}
                            aria-label="Delete Client Permanently"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                                    Deleting Client...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={15} aria-hidden="true" />
                                    Delete Permanently
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}

export default DeleteClientModal;
