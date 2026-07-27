import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAInstallContextType {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isStandalone: boolean;
    showIOSInstructions: boolean;
    setShowIOSInstructions: (show: boolean) => void;
    showAndroidInstructions: boolean;
    setShowAndroidInstructions: (show: boolean) => void;
    installApp: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

// Global variable to capture beforeinstallprompt even if it fires before React mounts
let globalDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        globalDeferredPrompt = e;
        console.log('[PWA] Global beforeinstallprompt event captured.');
    });
}

export const PWAInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('pwa_installed') === 'true';
    });
    const [isInstallable, setIsInstallable] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

    useEffect(() => {
        // Register Service Worker reliably
        if ('serviceWorker' in navigator) {
            const registerSW = () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('[SW] Service worker registered successfully:', reg.scope);
                    })
                    .catch((err) => {
                        console.error('[SW] Service worker registration failed:', err);
                    });
            };

            if (document.readyState === 'complete') {
                registerSW();
            } else {
                window.addEventListener('load', registerSW);
            }
        }

        // Check standalone mode & existing installed status
        const checkInstallationStatus = async () => {
            const isStandaloneMode = 
                window.matchMedia('(display-mode: standalone)').matches || 
                (navigator as any).standalone === true || 
                document.referrer.includes('android-app://') ||
                window.matchMedia('(display-mode: fullscreen)').matches ||
                window.matchMedia('(display-mode: minimal-ui)').matches;
            
            if (isStandaloneMode) {
                setIsStandalone(true);
                setIsInstalled(true);
                localStorage.setItem('pwa_installed', 'true');
                return;
            }

            // Check Chromium getInstalledRelatedApps API
            if ('getInstalledRelatedApps' in navigator) {
                try {
                    const relatedApps = await (navigator as any).getInstalledRelatedApps();
                    if (relatedApps && relatedApps.length > 0) {
                        setIsInstalled(true);
                        localStorage.setItem('pwa_installed', 'true');
                        return;
                    }
                } catch (err) {
                    console.warn('[PWA] Error checking getInstalledRelatedApps:', err);
                }
            }

            if (localStorage.getItem('pwa_installed') === 'true') {
                setIsInstalled(true);
            }
        };

        checkInstallationStatus();

        // Listen for display mode changes (e.g. user launches standalone window)
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleMediaQueryChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setIsStandalone(true);
                setIsInstalled(true);
                localStorage.setItem('pwa_installed', 'true');
            }
        };
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaQueryChange);
        }

        // Listen for PWA install prompt event (Android/Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            // If beforeinstallprompt fires, the app is not currently installed
            localStorage.removeItem('pwa_installed');
            setIsInstalled(false);
            globalDeferredPrompt = e;
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('[PWA] beforeinstallprompt event fired and captured in effect.');
        };

        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            globalDeferredPrompt = null;
            setIsInstalled(true);
            setIsStandalone(true);
            localStorage.setItem('pwa_installed', 'true');
            console.log('[PWA] App was successfully installed.');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Handle initial installability state
        const storedInstalled = localStorage.getItem('pwa_installed') === 'true';
        const currentlyInstalled = isStandalone || storedInstalled;

        if (!currentlyInstalled) {
            if (globalDeferredPrompt) {
                setDeferredPrompt(globalDeferredPrompt);
                setIsInstallable(true);
            } else if (isIOS || isAndroid) {
                setIsInstallable(true);
            }
        } else {
            setIsInstallable(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaQueryChange);
            }
        };
    }, [isIOS, isAndroid, isStandalone]);

    const installApp = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        const promptToUse = deferredPrompt || globalDeferredPrompt;

        if (!promptToUse) {
            if (isAndroid) {
                setShowAndroidInstructions(true);
            } else {
                console.warn('[PWA] No install prompt deferred.');
            }
            return;
        }

        try {
            promptToUse.prompt();
            const choiceResult = await promptToUse.userChoice;
            console.log(`[PWA] User response to install prompt: ${choiceResult.outcome}`);
            
            if (choiceResult.outcome === 'accepted') {
                setIsInstallable(false);
                setIsInstalled(true);
                localStorage.setItem('pwa_installed', 'true');
                setDeferredPrompt(null);
                globalDeferredPrompt = null;
            }
        } catch (err) {
            console.error('[PWA] Installation prompt failed:', err);
        }
    };

    return (
        <PWAInstallContext.Provider value={{
            isInstallable: isInstallable && !isInstalled && !isStandalone,
            isInstalled,
            isIOS,
            isAndroid,
            isStandalone,
            showIOSInstructions,
            setShowIOSInstructions,
            showAndroidInstructions,
            setShowAndroidInstructions,
            installApp
        }}>
            {children}
        </PWAInstallContext.Provider>
    );
};

export const usePWAInstall = () => {
    const context = useContext(PWAInstallContext);
    if (!context) {
        throw new Error('usePWAInstall must be used within a PWAInstallProvider');
    }
    return context;
};

