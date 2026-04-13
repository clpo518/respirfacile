import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Gauge, Activity, Loader2 } from "lucide-react";

interface GoalSelectionModalProps {
  open: boolean;
  userId: string;
  onComplete: (goal: "speed" | "fluency") => void;
}

const goals = [
  {
    id: "speed" as const,
    icon: Gauge,
    emoji: "🏃",
    title: "Parler moins vite",
    description: "Je parle trop vite et je veux ralentir mon débit (bredouillement, tachylalie)",
    color: "border-primary/50 bg-primary/5 hover:bg-primary/10",
    activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30",
  },
  {
    id: "fluency" as const,
    emoji: "🌊",
    icon: Activity,
    title: "Améliorer ma fluence",
    description: "Je veux travailler ma fluidité de parole (bégaiement, blocages, répétitions)",
    color: "border-accent/50 bg-accent/5 hover:bg-accent/10",
    activeColor: "border-accent bg-accent/15 ring-2 ring-accent/30",
  },
];

const GoalSelectionModal = ({ open, userId, onComplete }: GoalSelectionModalProps) => {
  const [selected, setSelected] = useState<"speed" | "fluency" | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ fluency_goal: selected } as any)
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        selected === "speed"
          ? "Parcours « Ralentir le débit » activé 🏃"
          : "Parcours « Fluence » activé 🌊"
      );
      onComplete(selected);
    } catch (err) {
      console.error("Error saving fluency goal:", err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-md mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-display">
            Quel est votre objectif ?
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Cela adapte votre parcours et vos exercices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {goals.map((goal, i) => (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(goal.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected === goal.id ? goal.activeColor : goal.color
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{goal.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground">{goal.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selected || saving}
          className="w-full h-11 sm:h-12"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Valider mon objectif"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Vous pourrez changer à tout moment dans les réglages
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default GoalSelectionModal;
