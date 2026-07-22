import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAInstallContextType {
    isInstallable: boolean;
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
    const [isInstallable, setIsInstallable] = useState(!!globalDeferredPrompt);
    const [isStandalone, setIsStandalone] = useState(false);
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

        // Check if already running in standalone (PWA) mode
        const checkStandalone = () => {
            const isStandaloneMode = 
                window.matchMedia('(display-mode: standalone)').matches || 
                (navigator as any).standalone || 
                document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
        };
        
        checkStandalone();

        // Listen for PWA install prompt event (Android/Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
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
            setIsStandalone(true);
            console.log('[PWA] App was successfully installed.');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if globalDeferredPrompt was captured before effect ran
        if (globalDeferredPrompt) {
            setDeferredPrompt(globalDeferredPrompt);
            setIsInstallable(true);
        } else if ((isIOS || isAndroid) && !isStandalone) {
            setIsInstallable(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
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
                setDeferredPrompt(null);
                globalDeferredPrompt = null;
            }
        } catch (err) {
            console.error('[PWA] Installation prompt failed:', err);
        }
    };

    return (
        <PWAInstallContext.Provider value={{
            isInstallable,
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
