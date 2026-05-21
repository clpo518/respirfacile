"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface CelebrationOverlayProps {
  show: boolean;
  message: string;
  subMessage?: string;
  onClose: () => void;
}

export default function CelebrationOverlay({
  show,
  message,
  subMessage,
  onClose,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!show) return;

    // Feu d'artifice latéral gauche-droite
    const end = Date.now() + 2500;
    const colors = ["#2D5016", "#8B4513", "#F5F0E8", "#4ade80", "#fbbf24"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .celebration-box {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <div className="celebration-box bg-white rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl">
        <div className="text-6xl mb-4 animate-bounce-slow">🎉</div>
        <h2 className="text-2xl font-bold text-forest-800 mb-2">{message}</h2>
        {subMessage && <p className="text-stone-500 mb-6 text-sm">{subMessage}</p>}
        <button
          onClick={onClose}
          className="bg-forest-500 text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-forest-600 transition-all duration-200 active:scale-95 w-full"
        >
          Super ! →
        </button>
      </div>
    </div>
  );
}
