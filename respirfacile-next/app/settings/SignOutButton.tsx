"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="rounded-full border-2 border-forest-300 px-6 py-2.5 text-sm font-semibold text-forest-600 hover:bg-forest-500 hover:text-beige-100 hover:border-forest-500 transition-colors disabled:opacity-50"
    >
      {isLoading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
