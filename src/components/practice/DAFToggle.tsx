/**
 * DAF (Delayed Auditory Feedback) Toggle Component
 * 
 * Renamed to "Mode Ralentisseur" for better UX understanding.
 * Allows users to enable the therapeutic DAF effect
 * with clear explanation, headphone warning, and Auto mode toggle.
 */

import { Headphones, Volume2, HelpCircle, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { DAFMode } from "@/hooks/useDAF";

interface DAFToggleProps {
  isEnabled: boolean;
  isActive: boolean;
  delayMs: number;
  mode: DAFMode;
  onToggle: () => void;
  onDelayChange: (ms: number) => void;
  onModeChange: (mode: DAFMode) => void;
  disabled?: boolean;
}

export default function DAFToggle({
  isEnabled,
  isActive,
  delayMs,
  mode,
  onToggle,
  onDelayChange,
  onModeChange,
  disabled = false
}: DAFToggleProps) {
  
  const handleToggle = () => {
    if (!isEnabled) {
      toast.warning("🎧 Casque ou écouteurs obligatoires !", {
        description: "Sans eux, vous entendrez un sifflement désagréable (Larsen).",
        duration: 5000,
      });
    }
    onToggle();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="daf-toggle" className="text-sm font-medium cursor-pointer">
                Mode Ralentisseur
              </Label>
              {isEnabled && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  DAF
                </span>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Comment ça marche ?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Ce mode renvoie votre voix dans vos oreilles avec un <strong>léger retard</strong> (100ms).
                    </p>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        🧠 Cet effet "écho" trompe votre cerveau et vous <strong>oblige mécaniquement</strong> à ralentir 
                        et à mieux articuler pour rester confortable.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Mode Auto :</strong> Le délai s'ajuste tout seul — il augmente quand vous accélérez 
                        et diminue quand vous êtes dans la cible. Aucun réglage à faire !
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      C'est une <strong>technique clinique très puissante</strong> utilisée par les orthophonistes 
                      pour traiter le bredouillement et la tachylalie.
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                      <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important :</strong> Utilisez un casque ou des écouteurs. 
                        Sans eux, le son revient dans le micro et crée un sifflement (larsen).
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Retour audio décalé pour forcer le ralentissement
            </span>
          </div>
        </div>
        
        <Switch
          id="daf-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Headphone warning */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700">
              <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                🎧 Casque obligatoire pour éviter le sifflement !
              </p>
            </div>

            {/* Mode selector: Manual / Auto */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onModeChange('manual')}
                disabled={disabled}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                  mode === 'manual'
                    ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Manuel
              </button>
              <button
                onClick={() => onModeChange('auto')}
                disabled={disabled}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                  mode === 'auto'
                    ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Auto ✨
              </button>
            </div>

            {mode === 'auto' ? (
              <div className="p-2.5 rounded-lg bg-muted/50 border text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Mode automatique actif</p>
                <p>Le délai s'adapte à votre débit en temps réel.</p>
                {isActive && (
                  <p className="font-mono text-primary">
                    Délai actuel : {delayMs}ms
                  </p>
                )}
              </div>
            ) : (
              /* Manual delay slider */
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Intensité du décalage</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{delayMs}ms</span>
                </div>
                <Slider
                  value={[delayMs]}
                  onValueChange={([value]) => onDelayChange(value)}
                  min={50}
                  max={250}
                  step={25}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>50ms (subtil)</span>
                  <span>250ms (puissant)</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
