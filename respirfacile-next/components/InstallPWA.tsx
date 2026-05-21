'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide prompt if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 left-6 flex items-center gap-2 bg-beige-100 hover:bg-beige-200 border border-beige-300 rounded-full px-4 py-2.5 text-sm font-medium text-forest-700 shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 z-40"
      aria-label="Installer l'application"
    >
      <span>📱</span>
      <span>Installer l&apos;app</span>
    </button>
  );
}
