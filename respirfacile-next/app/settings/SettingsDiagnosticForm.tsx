"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type DiagnosticType =
  | "adult_saos_mild"
  | "adult_saos_severe"
  | "adult_tmof"
  | "adult_mixed";

interface SettingsDiagnosticFormProps {
  initialDiagnostic?: DiagnosticType | null;
  userId: string;
}

const DIAGNOSTIC_OPTIONS: Array<{
  value: DiagnosticType;
  label: string;
  description: string;
}> = [
  {
    value: "adult_saos_mild",
    label: "SAOS léger/modéré",
    description: "Apnée du sommeil légère ou modérée sans appareillage",
  },
  {
    value: "adult_saos_severe",
    label: "SAOS sévère",
    description: "Apnée du sommeil sévère, généralement sous CPAP",
  },
  {
    value: "adult_tmof",
    label: "TMOF pure",
    description: "Thérapie myofonctionnelle orofaciale sans SAOS",
  },
  {
    value: "adult_mixed",
    label: "SAOS + TMOF",
    description: "Combinaison SAOS et thérapie myofonctionnelle",
  },
];

export function SettingsDiagnosticForm({
  initialDiagnostic,
  userId,
}: SettingsDiagnosticFormProps) {
  const supabase = createClient();
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<
    DiagnosticType | null
  >(initialDiagnostic || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (newDiagnostic: DiagnosticType) => {
    setSelectedDiagnostic(newDiagnostic);
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ diagnostic_type: newDiagnostic })
        .eq("id", userId);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        setSelectedDiagnostic(initialDiagnostic || null);
      } else {
        toast.success("Diagnostic mis à jour");
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
      setSelectedDiagnostic(initialDiagnostic || null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {DIAGNOSTIC_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
            selectedDiagnostic === option.value
              ? "border-forest-500 bg-forest-50"
              : "border-beige-300 bg-beige-100 hover:bg-beige-150"
          }`}
        >
          <input
            type="radio"
            name="diagnostic"
            value={option.value}
            checked={selectedDiagnostic === option.value}
            onChange={() => handleChange(option.value)}
            disabled={isLoading}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <div className="ml-3 flex-1">
            <p className="font-semibold text-forest-800">{option.label}</p>
            <p className="text-sm text-forest-600">{option.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
