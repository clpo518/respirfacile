import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dna, Lock, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const THIS_YEAR = new Date().getFullYear();

function validateBirthYear(year: number): { valid: boolean; error?: string } {
  if (year < 1900 || year > THIS_YEAR - 1) return { valid: false, error: "Année invalide" };
  if (THIS_YEAR - year < 18) return { valid: false, error: "L'application est réservée aux adultes (18+)" };
  return { valid: true };
}

function getAgeGroupLabel(year: number): string {
  const age = THIS_YEAR - year;
  if (age < 30) return "Jeune adulte";
  if (age < 50) return "Adulte";
  if (age < 65) return "Senior";
  return "Sénior+";
}

interface AgeCalibrationModalProps {
  open: boolean;
  userId: string;
  onComplete: (birthYear: number) => void;
}

const AgeCalibrationModal = ({ open, userId, onComplete }: AgeCalibrationModalProps) => {
  const [birthYear, setBirthYear] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parsedYear = parseInt(birthYear, 10);
  const isValidYear = !isNaN(parsedYear) && validateBirthYear(parsedYear).valid;
  const previewAgeGroup = isValidYear ? getAgeGroupLabel(parsedYear) : null;

  const handleSubmit = async () => {
    const year = parseInt(birthYear, 10);
    const validation = validateBirthYear(year);

    if (!validation.valid) {
      setError(validation.error || "Année invalide");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ birth_year: year })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Programme calibré ! 🎯", {
        description: `Votre programme est maintenant adapté à votre tranche d'âge`
      });

      onComplete(year);
    } catch (err) {
      console.error("Error saving birth year:", err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleYearChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setBirthYear(numericValue);
    setError(null);
    setShowPreview(numericValue.length === 4);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Dna className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-display">
            Un objectif adapté à votre âge
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Pour des résultats réalistes et un entraînement sur-mesure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="birth-year" className="text-sm sm:text-base font-medium">
              Année de naissance
            </Label>
            <Input
              id="birth-year"
              type="text"
              inputMode="numeric"
              placeholder={`ex: ${THIS_YEAR - 30}`}
              value={birthYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="text-center text-lg sm:text-xl font-mono h-12 sm:h-14"
              maxLength={4}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <AnimatePresence>
            {showPreview && isValidYear && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Votre tranche d'âge</p>
                    <p className="text-2xl font-bold text-primary">
                      {previewAgeGroup}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Programme adapté</p>
                    <p className="font-medium text-primary">✓</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs sm:text-sm">Pourquoi cette question ?</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Chaque tranche d'âge a des besoins différents en rééducation respiratoire.
                  Cette info adapte votre <span className="text-primary font-medium">programme</span> à votre profil.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Donnée privée, utilisée uniquement pour le calibrage.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValidYear || saving}
            className="w-full h-11 sm:h-12 text-sm sm:text-base"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calibrage...
              </>
            ) : (
              "Calibrer mon objectif"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeCalibrationModal;
