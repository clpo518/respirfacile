"use client";

import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "other",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pour l'MVP, on affiche simplement un message de succès
      // Une implémentation réelle enverrait l'email ou sauvegarderait les données
      setIsSubmitted(true);
      setFormData({ name: "", email: "", type: "other", message: "" });

      // Réinitialiser après 3 secondes
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Votre nom complet"
          className="w-full px-4 py-3 border border-beige-300 rounded-lg text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="votre@email.com"
          className="w-full px-4 py-3 border border-beige-300 rounded-lg text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">
          Je suis...
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-beige-300 rounded-lg text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        >
          <option value="therapist">Orthophoniste</option>
          <option value="kine">Kinésithérapeute</option>
          <option value="patient">Patient</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Votre message..."
          rows={5}
          className="w-full px-4 py-3 border border-beige-300 rounded-lg text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none"
        />
      </div>

      {isSubmitted ? (
        <div className="rounded-lg bg-forest-500/10 border border-forest-500/20 p-4">
          <p className="text-sm font-medium text-forest-700">
            ✓ Merci ! On vous répond sous 24h.
          </p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-forest-500 px-6 py-3 font-semibold text-beige-100 hover:bg-forest-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer"}
        </button>
      )}
    </form>
  );
}
