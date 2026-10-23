import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import capacitorService from '../services/capacitorService';

const PwaContext = createContext(null);

export function PwaProvider({ children }) {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(capacitorService.isStandalonePwa());
    const [isOffline, setIsOffline] = useState(!capacitorService.isOnline);
    const [showBanner, setShowBanner] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !sessionStorage.getItem('observex_pwa_banner_dismissed');
    });
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        // Subscribe to PWA installation state
        const unsubscribeInstall = capacitorService.onInstallChange((canInstall) => {
            setIsInstallable(canInstall);
            setIsInstalled(capacitorService.isStandalonePwa());
        });

        // Subscribe to network connectivity state
        const unsubscribeNetwork = capacitorService.onNetworkChange((isOnline) => {
            setIsOffline(!isOnline);
        });

        return () => {
            unsubscribeInstall();
            unsubscribeNetwork();
        };
    }, []);

    // Prompt user to install the PWA
    const installPwa = useCallback(async () => {
        capacitorService.triggerHaptic('medium');
        const res = await capacitorService.promptInstall();
        if (res.outcome === 'accepted') {
            setShowBanner(false);
        }
        return res;
    }, []);

    // Dismiss the floating install banner
    const dismissBanner = useCallback(() => {
        capacitorService.triggerHaptic('light');
        setShowBanner(false);
        try {
            sessionStorage.setItem('observex_pwa_banner_dismissed', 'true');
        } catch {
            // Ignore storage issues in private mode
        }
    }, []);

    // Trigger haptics feedback
    const triggerHaptic = useCallback((type = 'light') => {
        capacitorService.triggerHaptic(type);
    }, []);

    const value = {
        isInstallable,
        isInstalled,
        isOffline,
        showBanner: showBanner && isInstallable && !isInstalled,
        hasUpdate,
        platform: capacitorService.getPlatform(),
        isNative: capacitorService.isNative(),
        installPwa,
        dismissBanner,
        triggerHaptic,
    };

    return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
    const context = useContext(PwaContext);
    if (!context) {
        throw new Error('usePwa must be used within a PwaProvider');
    }
    return context;
}

export default PwaContext;
