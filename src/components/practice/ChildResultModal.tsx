import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RotateCcw, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface ChildResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration: number;
  sessionId?: string;
  onContinue: () => void;
  onRetry: () => void;
}

type ChildSentiment = "happy" | "ok" | "hard";

const CHILD_SENTIMENTS: { value: ChildSentiment; emoji: string; label: string; dbValue: string }[] = [
  { value: "happy", emoji: "😄", label: "Super !", dbValue: "comfortable" },
  { value: "ok", emoji: "😊", label: "Ça va", dbValue: "comfortable" },
  { value: "hard", emoji: "😅", label: "Difficile", dbValue: "too_fast" },
];

const getStars = (duration: number): number => {
  if (duration >= 30) return 3;
  if (duration >= 15) return 2;
  return 1;
};

const STAR_MESSAGES = [
  "Tu as essayé, bravo ! 💪",
  "Très bien travaillé ! 🎉",
  "Champion(ne) ! Tu es incroyable ! 🏆",
];

const ChildResultModal = ({
  open,
  onOpenChange,
  duration,
  sessionId,
  onContinue,
  onRetry,
}: ChildResultModalProps) => {
  const stars = getStars(duration);
  const [selectedSentiment, setSelectedSentiment] = useState<ChildSentiment | null>(null);

  useEffect(() => {
    if (open && stars === 3) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#32CD32", "#1E90FF"],
      });
    }
  }, [open, stars]);

  const handleSentimentSelect = async (sentiment: ChildSentiment) => {
    setSelectedSentiment(sentiment);
    if (!sessionId) return;
    const dbValue = CHILD_SENTIMENTS.find((s) => s.value === sentiment)?.dbValue || "comfortable";
    try {
      await supabase
        .from("sessions")
        .update({ patient_sentiment: dbValue })
        .eq("id", sessionId);
    } catch (e) {
      console.error("Error saving child sentiment:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <div className="space-y-6 py-4 text-center">
          {/* Stars */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center gap-2"
          >
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.2 }}
                className={`text-5xl ${i <= stars ? "" : "grayscale opacity-30"}`}
              >
                ⭐
              </motion.span>
            ))}
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xl font-bold">{STAR_MESSAGES[stars - 1]}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tu as parlé pendant{" "}
              <span className="font-bold text-foreground">
                {duration < 60
                  ? `${duration} secondes`
                  : `${Math.floor(duration / 60)} min ${duration % 60}s`}
              </span>
            </p>
          </motion.div>

          {/* Child sentiment */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">Comment tu te sens ?</p>
            <div className="flex justify-center gap-3">
              {CHILD_SENTIMENTS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => handleSentimentSelect(value)}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                    selectedSentiment === value
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs mt-1">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex gap-3"
          >
            <Button onClick={onRetry} className="flex-1 gap-2 rounded-xl h-12">
              <RotateCcw className="w-4 h-4" />
              Encore !
            </Button>
            <Button variant="outline" onClick={onContinue} className="flex-1 gap-2 rounded-xl h-12">
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildResultModal;
