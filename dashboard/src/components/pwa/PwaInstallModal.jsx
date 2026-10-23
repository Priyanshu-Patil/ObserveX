import React, { useEffect, useState } from 'react';
import { Portal } from '../ui/Portal';
import { Button } from '../ui/Button';
import { Download, X, Compass, PlusSquare, ArrowUpRight, Monitor, Smartphone } from 'lucide-react';
import sharedStyles from '../../styles/modules/ui/SharedUi.module.scss';
import styles from './PwaModal.module.scss';

export function PwaInstallModal({ open, onClose, onInstallDirectly, canInstallDirectly }) {
    const [browserInfo, setBrowserInfo] = useState({ isSafari: false, isIOS: false, isMac: false, isChrome: true });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const ua = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
        const isSafari = /safari/.test(ua) && !/chrome|chromium|edg|crios|android/.test(ua);
        const isChrome = /chrome|chromium|edg/.test(ua);

        setBrowserInfo({ isSafari, isIOS, isMac, isChrome });
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <Portal>
            <div
                className={sharedStyles.modalOverlay}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pwa-install-title"
                onClick={onClose}
            >
                <div className={sharedStyles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={sharedStyles.modalHeader} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                                src="/2.png"
                                alt="ObserveX Logo"
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    background: 'hsl(var(--background))',
                                    objectFit: 'cover',
                                }}
                            />
                            <div>
                                <h3 id="pwa-install-title" className={sharedStyles.modalTitle}>
                                    Install ObserveX
                                </h3>
                                <p className={sharedStyles.modalDescription} style={{ margin: 0, fontSize: '0.78125rem' }}>
                                    Progressive Web App
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.35rem',
                                color: 'hsl(var(--muted-foreground))',
                                borderRadius: '0.375rem',
                            }}
                            aria-label="Close modal"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className={sharedStyles.modalBody} style={{ padding: '1.25rem 1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))', margin: '0 0 1rem', lineHeight: '1.45' }}>
                            Install ObserveX on your desktop or mobile device for standalone window access, faster loading, and offline metric telemetry.
                        </p>

                        <div className={styles.instructionCard}>
                            {canInstallDirectly ? (
                                <div className={styles.stepRow}>
                                    <div className={styles.stepNumber}>1</div>
                                    <div>
                                        <strong>Click the Install button below</strong>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                                            Confirm the browser prompt to add ObserveX to your applications.
                                        </p>
                                    </div>
                                </div>
                            ) : browserInfo.isIOS ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className={styles.stepRow}>
                                        <ArrowUpRight size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <strong>Tap the Share button</strong> in the Safari bottom toolbar.
                                        </div>
                                    </div>
                                    <div className={styles.stepRow}>
                                        <PlusSquare size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.
                                        </div>
                                    </div>
                                </div>
                            ) : browserInfo.isSafari && browserInfo.isMac ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className={styles.stepRow}>
                                        <Compass size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            Click <strong>File</strong> in the top macOS menu bar.
                                        </div>
                                    </div>
                                    <div className={styles.stepRow}>
                                        <PlusSquare size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            Select <strong>&quot;Add to Dock...&quot;</strong> and click <strong>Add</strong>.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className={styles.stepRow}>
                                        <Monitor size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            Look for the <strong>Install icon (⊕)</strong> on the right side of your browser address bar.
                                        </div>
                                    </div>
                                    <div className={styles.stepRow}>
                                        <Download size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            Or click browser menu <strong>(⋮) &gt; &quot;Save and share&quot; &gt; &quot;Install ObserveX...&quot;</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={sharedStyles.modalFooter}>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Close
                        </Button>
                        {canInstallDirectly && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    onInstallDirectly();
                                    onClose();
                                }}
                            >
                                <Download size={14} />
                                <span>Install Now</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}

export default PwaInstallModal;
