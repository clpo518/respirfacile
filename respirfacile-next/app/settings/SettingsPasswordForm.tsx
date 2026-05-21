"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function SettingsPasswordForm() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Ancien mot de passe requis";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Nouveau mot de passe requis";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Mot de passe changé avec succès");
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="oldPassword" className="text-sm font-medium text-forest-700">
          Ancien mot de passe
        </label>
        <input
          type="password"
          id="oldPassword"
          value={formData.oldPassword}
          onChange={(e) =>
            setFormData({ ...formData, oldPassword: e.target.value })
          }
          className="mt-2 w-full px-4 py-2 border border-beige-300 rounded-2xl text-forest-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
          placeholder="Entrez votre ancien mot de passe"
        />
        {errors.oldPassword && (
          <p className="text-sm text-copper-500 mt-1">{errors.oldPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="text-sm font-medium text-forest-700">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          id="newPassword"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          className="mt-2 w-full px-4 py-2 border border-beige-300 rounded-2xl text-forest-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
          placeholder="Entrez votre nouveau mot de passe"
        />
        {errors.newPassword && (
          <p className="text-sm text-copper-500 mt-1">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-forest-700"
        >
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="mt-2 w-full px-4 py-2 border border-beige-300 rounded-2xl text-forest-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
          placeholder="Confirmez votre nouveau mot de passe"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-copper-500 mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-forest-600 text-beige-100 py-3 rounded-2xl font-semibold hover:bg-forest-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
      </button>
    </form>
  );
}
