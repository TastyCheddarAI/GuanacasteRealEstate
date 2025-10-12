import { useState, useEffect } from 'react';

interface PWAUpdateState {
  isUpdateAvailable: boolean;
  isInstalling: boolean;
  updateApp: () => void;
  dismissUpdate: () => void;
}

export function usePWA(): PWAUpdateState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if PWA is supported
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data || {};

          if (type === 'UPDATE_AVAILABLE') {
            setIsUpdateAvailable(true);
          }
        });
      });

      // Handle PWA install prompt
      let deferredPrompt: any;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
      });

      // Check if already installed
      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
      });
    }

    // Listen for online/offline status
    const handleOnline = () => {
      // Trigger sync when coming back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_REQUEST'
        });
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const updateApp = async () => {
    if (!registration) return;

    setIsInstalling(true);

    try {
      // Tell the service worker to skip waiting
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Wait for the new service worker to take control
        registration.waiting.addEventListener('statechange', (e) => {
          const target = e.target as ServiceWorker;
          if (target.state === 'activated') {
            window.location.reload();
          }
        });
      } else {
        // Force refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update PWA:', error);
      setIsInstalling(false);
    }
  };

  const dismissUpdate = () => {
    setIsUpdateAvailable(false);
  };

  return {
    isUpdateAvailable,
    isInstalling,
    updateApp,
    dismissUpdate
  };
}

// Utility functions for PWA management
export const pwaUtils = {
  // Check if app is installed
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Get app version
  getVersion: async (): Promise<string> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data.version || 'unknown');
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [channel.port2]
        );

        // Timeout fallback
        setTimeout(() => resolve('unknown'), 1000);
      } else {
        resolve('unknown');
      }
    });
  },

  // Clear all caches
  clearCache: async (): Promise<void> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [channel.port2]
        );

        // Timeout fallback
        setTimeout(() => resolve(), 2000);
      } else {
        resolve();
      }
    });
  },

  // Check online status
  isOnline: () => {
    return navigator.onLine;
  },

  // Get cache storage info
  getCacheInfo: async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheInfo = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return { name, entries: keys.length };
          })
        );
        return cacheInfo;
      } catch (error) {
        console.error('Failed to get cache info:', error);
        return [];
      }
    }
    return [];
  }
};