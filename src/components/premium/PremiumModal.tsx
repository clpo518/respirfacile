import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Lock, Sparkles, BookOpen, BarChart3, HeadphonesIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseTitle?: string;
}

const PremiumModal = ({ open, onOpenChange, exerciseTitle }: PremiumModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-900/50 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Débloquez tout le potentiel
          </DialogTitle>
          <DialogDescription className="text-center">
            {exerciseTitle ? (
              <>
                <strong>"{exerciseTitle}"</strong> fait partie du pack Premium.
              </>
            ) : (
              "Accédez à la bibliothèque complète et à tous les exercices en illimité."
            )}
            <br />
            Passez Premium pour une pratique sans limite !
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground mb-4">
            <strong className="text-primary">79€/an</strong> (soit 6,58€/mois) ou <strong>9€/mois</strong>
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Bibliothèque complète : +60 exercices variés</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <HeadphonesIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Partage Audio avec votre Orthophoniste</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Historique complet et courbes de progression</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Support prioritaire VIP</span>
            </li>
          </ul>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600 text-white shadow-lg" 
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
          >
            <Crown className="w-4 h-4" />
            Passer Premium (Essai libre)
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
