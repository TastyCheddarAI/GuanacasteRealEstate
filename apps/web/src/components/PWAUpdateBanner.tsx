import React from 'react';
import { Button } from '@guanacaste-real/ui';
import { RefreshCw, X, Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAUpdateBannerProps {
  className?: string;
}

export function PWAUpdateBanner({ className = '' }: PWAUpdateBannerProps) {
  const { isUpdateAvailable, isInstalling, updateApp, dismissUpdate } = usePWA();

  if (!isUpdateAvailable) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs opacity-90 truncate">
              A new version of Guanacaste Real is ready to install
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={updateApp}
            disabled={isInstalling}
            size="sm"
            className="bg-white text-cyan-600 hover:bg-gray-50 disabled:opacity-50 h-8 px-3 text-xs font-medium"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Update
              </>
            )}
          </Button>

          <button
            onClick={dismissUpdate}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Dismiss update"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress indicator for mobile */}
      {isInstalling && (
        <div className="mt-3">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div className="bg-white h-1 rounded-full animate-pulse w-1/3"></div>
          </div>
          <p className="text-xs opacity-75 mt-1">Installing update...</p>
        </div>
      )}
    </div>
  );
}

// PWA Install Prompt Component
interface PWAInstallPromptProps {
  className?: string;
}

export function PWAInstallPrompt({ className = '' }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setIsVisible(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismissPrompt = () => {
    setIsVisible(false);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">Install App</h3>
            <p className="text-xs opacity-90 truncate">
              Get the full Guanacaste Real experience on your device
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-green-600 hover:bg-gray-50 h-8 px-3 text-xs font-medium"
          >
            Install
          </Button>

          <button
            onClick={dismissPrompt}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}