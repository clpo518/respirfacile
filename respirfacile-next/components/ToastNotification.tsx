"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  duration?: number;
}

export default function ToastNotification({
  message,
  type = "success",
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor =
    type === "success"
      ? "bg-forest-500"
      : type === "warning"
        ? "bg-amber-500"
        : "bg-stone-700";

  const iconMap = {
    success: "✓",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px) translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }
        .toast-notification {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <div
        className={`toast-notification ${bgColor} text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2`}
      >
        <span>{iconMap[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
