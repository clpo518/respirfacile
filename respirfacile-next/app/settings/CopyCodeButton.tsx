"use client";

import { useState } from "react";

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-full border-2 border-forest-300 px-6 py-2.5 text-sm font-semibold text-forest-600 hover:bg-forest-500 hover:text-beige-100 hover:border-forest-500 transition-colors"
    >
      {copied ? "✓ Copié" : "Copier"}
    </button>
  );
}
