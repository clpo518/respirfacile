"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SettingsNameFormProps {
  initialName: string | null;
  userId: string;
  onSuccess?: () => void;
}

export function SettingsNameForm({
  initialName,
  userId,
  onSuccess,
}: SettingsNameFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", userId);

      if (updateError) throw updateError;

      setIsEditing(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(initialName || "");
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-forest-800 font-medium">{name || "—"}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs font-semibold text-copper-500 hover:text-copper-600 transition-colors"
        >
          Éditer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom complet"
        className="w-full px-3 py-2 border border-beige-300 rounded-lg text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="text-xs font-semibold bg-forest-500 text-beige-100 px-3 py-1.5 rounded-lg hover:bg-forest-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="text-xs font-semibold border border-beige-300 text-forest-600 px-3 py-1.5 rounded-lg hover:bg-beige-200 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
