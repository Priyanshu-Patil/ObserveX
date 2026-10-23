import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

class CapacitorService {
    constructor() {
        this.deferredInstallPrompt = null;
        this.installPromptListeners = new Set();
        this.networkListeners = new Set();
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (typeof window !== 'undefined') {
            this.initPwaListeners();
            this.initNetworkListeners();
        }
    }

    /**
     * Get the active platform ('web', 'ios', 'android')
     */
    getPlatform() {
        return Capacitor.getPlatform();
    }

    /**
     * Check if currently running inside a native mobile wrapper
     */
    isNative() {
        return Capacitor.isNativePlatform();
    }

    /**
     * Check if running as an installed standalone PWA
     */
    isStandalonePwa() {
        if (typeof window === 'undefined') return false;
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')
        );
    }

    /**
     * Listen for PWA installation prompt
     */
    initPwaListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent immediate mini-infobar on mobile Chrome
            e.preventDefault();
            this.deferredInstallPrompt = e;
            this.notifyInstallListeners(true);
        });

        window.addEventListener('appinstalled', () => {
            this.deferredInstallPrompt = null;
            this.notifyInstallListeners(false);
            console.log('[ObserveX PWA] Successfully installed as Progressive Web App');
        });
    }

    /**
     * Initialize Network listeners with Capacitor Network plugin + fallback
     */
    async initNetworkListeners() {
        try {
            const status = await Network.getStatus();
            this.isOnline = status.connected;
            this.notifyNetworkListeners(this.isOnline);

            await Network.addListener('networkStatusChange', (status) => {
                this.isOnline = status.connected;
                this.notifyNetworkListeners(this.isOnline);
            });
        } catch {
            // Fallback to standard web events if plugin is unavailable
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.notifyNetworkListeners(true);
            });
            window.addEventListener('offline', () => {
                this.isOnline = false;
                this.notifyNetworkListeners(false);
            });
        }
    }

    /**
     * Trigger PWA installation modal
     */
    async promptInstall() {
        if (!this.deferredInstallPrompt) {
            return { outcome: 'unavailable' };
        }

        try {
            this.triggerHaptic('light');
            await this.deferredInstallPrompt.prompt();
            const choiceResult = await this.deferredInstallPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                this.deferredInstallPrompt = null;
                this.notifyInstallListeners(false);
            }
            return choiceResult;
        } catch (err) {
            console.error('[ObserveX PWA] Install prompt failed:', err);
            return { outcome: 'dismissed' };
        }
    }

    /**
     * Check if installation prompt is currently ready
     */
    canInstall() {
        return !!this.deferredInstallPrompt && !this.isStandalonePwa();
    }

    /**
     * Add listener for install readiness
     */
    onInstallChange(callback) {
        this.installPromptListeners.add(callback);
        callback(this.canInstall());
        return () => this.installPromptListeners.delete(callback);
    }

    notifyInstallListeners(isReady) {
        this.installPromptListeners.forEach((cb) => {
            try {
                cb(isReady);
            } catch (err) {
                console.error(err);
            }
        });
    }

    /**
     * Add listener for network status changes
     */
    onNetworkChange(callback) {
        this.networkListeners.add(callback);
        callback(this.isOnline);
        return () => this.networkListeners.delete(callback);
    }

    notifyNetworkListeners(isOnline) {
        this.networkListeners.forEach((cb) => {
            try {
                cb(isOnline);
            } catch (err) {
                console.error(err);
            }
        });
    }

    /**
     * Haptic feedback via Capacitor Haptics with web vibration fallback
     */
    async triggerHaptic(type = 'light') {
        try {
            if (Capacitor.isPluginAvailable('Haptics')) {
                switch (type) {
                    case 'light':
                        await Haptics.impact({ style: ImpactStyle.Light });
                        break;
                    case 'medium':
                        await Haptics.impact({ style: ImpactStyle.Medium });
                        break;
                    case 'heavy':
                        await Haptics.impact({ style: ImpactStyle.Heavy });
                        break;
                    case 'success':
                        await Haptics.notification({ type: NotificationType.Success });
                        break;
                    case 'warning':
                        await Haptics.notification({ type: NotificationType.Warning });
                        break;
                    case 'error':
                        await Haptics.notification({ type: NotificationType.Error });
                        break;
                    default:
                        await Haptics.vibrate();
                }
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(type === 'heavy' ? 30 : 15);
            }
        } catch {
            // Haptics not available on this browser/environment; fail silently
        }
    }

    /**
     * Setup back button / app active state hooks
     */
    async onAppStateChange(callback) {
        try {
            if (Capacitor.isPluginAvailable('App')) {
                return await App.addListener('appStateChange', callback);
            }
        } catch {
            return null;
        }
    }
}

export const capacitorService = new CapacitorService();
export default capacitorService;
