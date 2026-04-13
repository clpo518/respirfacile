import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CustomTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_CHARS = 20;
const MAX_CHARS = 5000;

const CustomTextModal = ({ open, onOpenChange }: CustomTextModalProps) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const charCount = text.trim().length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  const handleStart = () => {
    const cleaned = text.trim();
    if (!isValid) {
      toast.error(`Le texte doit contenir entre ${MIN_CHARS} et ${MAX_CHARS} caractères.`);
      return;
    }
    // Store in sessionStorage (not localStorage — ephemeral)
    sessionStorage.setItem("custom_practice_text", cleaned);
    onOpenChange(false);
    navigate("/practice?custom=true");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Coller mon texte
          </DialogTitle>
          <DialogDescription>
            Collez n'importe quel texte pour vous entraîner à le lire à la bonne vitesse avec le biofeedback en temps réel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Collez votre texte ici... (exposé, article, texte clinique, etc.)"
            className="min-h-[180px] text-sm font-serif leading-relaxed resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {charCount < MIN_CHARS 
                ? `Encore ${MIN_CHARS - charCount} caractères minimum` 
                : `${charCount} / ${MAX_CHARS} caractères`}
            </span>
            {charCount > 0 && (
              <button
                onClick={() => setText("")}
                className="text-destructive hover:underline"
              >
                Effacer
              </button>
            )}
          </div>

          <Button
            onClick={handleStart}
            disabled={!isValid}
            className="w-full gap-2"
            size="lg"
          >
            🎯 S'entraîner sur ce texte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTextModal;
