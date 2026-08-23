"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle } from "lucide-react";

export default function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production/browser
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("🟢 [PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("🔴 [PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://");
      
      if (isStandalone) {
        setIsInstalled(true);
      }

      // 3. Listen for browser install prompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show banner after 3 seconds for smooth UX
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        console.log("🎉 [PWA] SmartWaste AI was installed!");
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {children}

      {/* Floating PWA Install Prompt Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 backdrop-blur-md animate-bounce-subtle transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex-shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                <span>Install SmartWaste AI</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono">PWA</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Add to your home screen for quick offline waste scanning and live GIS maps.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
