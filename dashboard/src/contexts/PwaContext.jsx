import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import capacitorService from '../services/capacitorService';
import PwaInstallModal from '../components/pwa/PwaInstallModal';

const PwaContext = createContext(null);

export function PwaProvider({ children }) {
    const [canInstallDirectly, setCanInstallDirectly] = useState(false);
    const [isInstalled, setIsInstalled] = useState(capacitorService.isStandalonePwa());
    const [isOffline, setIsOffline] = useState(!capacitorService.isOnline);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Subscribe to PWA installation state
        const unsubscribeInstall = capacitorService.onInstallChange((canInstall) => {
            setCanInstallDirectly(canInstall);
            setIsInstalled(capacitorService.isStandalonePwa());
        });

        // Subscribe to network connectivity state
        const unsubscribeNetwork = capacitorService.onNetworkChange((isOnline) => {
            setIsOffline(!isOnline);
        });

        // Listen for display mode changes (e.g. user opens standalone window)
        const displayModeQuery = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = (e) => {
            if (e.matches) {
                setIsInstalled(true);
            }
        };
        displayModeQuery.addEventListener('change', handleDisplayModeChange);

        return () => {
            unsubscribeInstall();
            unsubscribeNetwork();
            displayModeQuery.removeEventListener('change', handleDisplayModeChange);
        };
    }, []);

    // Prompt user to install the PWA or show browser guidance modal
    const installPwa = useCallback(async () => {
        capacitorService.triggerHaptic('medium');

        if (canInstallDirectly) {
            const res = await capacitorService.promptInstall();
            if (res.outcome === 'accepted') {
                setIsInstalled(true);
                setBannerDismissed(true);
                return res;
            }
        }

        // If direct prompt was already consumed or unavailable on this browser, show the guide modal
        setIsModalOpen(true);
    }, [canInstallDirectly]);

    const dismissBanner = useCallback(() => {
        capacitorService.triggerHaptic('light');
        setBannerDismissed(true);
    }, []);

    const triggerHaptic = useCallback((type = 'light') => {
        capacitorService.triggerHaptic(type);
    }, []);

    const value = {
        isInstallable: !isInstalled,
        canInstallDirectly,
        isInstalled,
        isOffline,
        showBanner: !bannerDismissed && !isInstalled,
        openInstallModal: () => setIsModalOpen(true),
        closeInstallModal: () => setIsModalOpen(false),
        installPwa,
        dismissBanner,
        triggerHaptic,
        platform: capacitorService.getPlatform(),
        isNative: capacitorService.isNative(),
    };

    return (
        <PwaContext.Provider value={value}>
            {children}
            <PwaInstallModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInstallDirectly={installPwa}
                canInstallDirectly={canInstallDirectly}
            />
        </PwaContext.Provider>
    );
}

export function usePwa() {
    const context = useContext(PwaContext);
    if (!context) {
        throw new Error('usePwa must be used within a PwaProvider');
    }
    return context;
}

export default PwaContext;
