"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CelebrationToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("celebration") === "1") {
      setShow(true);
      setTimeout(() => setShow(false), 4000);
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -16px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <div className="bg-[#2D5016] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
        <span className="text-xl">✓</span>
        <div>
          <p className="font-semibold">Séance enregistrée !</p>
          <p className="text-white/80 text-sm">
            Votre orthophoniste peut voir votre progression
          </p>
        </div>
      </div>
    </div>
  );
}
