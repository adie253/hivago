import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAInstallContextType {
    isInstallable: boolean;
    isIOS: boolean;
    isStandalone: boolean;
    showIOSInstructions: boolean;
    setShowIOSInstructions: (show: boolean) => void;
    installApp: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export const PWAInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('[SW] Service worker registered successfully:', reg.scope);
                    })
                    .catch((err) => {
                        console.error('[SW] Service worker registration failed:', err);
                    });
            });
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
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('[PWA] beforeinstallprompt event fired and captured.');
        };

        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            setIsStandalone(true);
            console.log('[PWA] App was successfully installed.');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // For iOS devices, since they don't support beforeinstallprompt, they are technically always "installable" 
        // if they are not already in standalone/PWA mode.
        if (isIOS && !isStandalone) {
            setIsInstallable(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [isIOS, isStandalone]);

    const installApp = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) {
            console.warn('[PWA] No install prompt deferred.');
            return;
        }

        try {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            console.log(`[PWA] User response to install prompt: ${choiceResult.outcome}`);
            
            if (choiceResult.outcome === 'accepted') {
                setIsInstallable(false);
                setDeferredPrompt(null);
            }
        } catch (err) {
            console.error('[PWA] Installation prompt failed:', err);
        }
    };

    return (
        <PWAInstallContext.Provider value={{
            isInstallable,
            isIOS,
            isStandalone,
            showIOSInstructions,
            setShowIOSInstructions,
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
