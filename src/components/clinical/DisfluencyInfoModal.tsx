import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Info } from "lucide-react";

interface DisfluencyInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DisfluencyInfoModal = ({ open, onOpenChange }: DisfluencyInfoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-purple-600" />
            Comment fonctionne la détection du bégaiement ?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Comprendre ce que l'outil détecte et ses limites
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Explanation */}
          <p className="text-sm text-foreground leading-relaxed">
            Cet outil analyse le <strong>signal audio</strong> pour repérer des indices 
            pouvant évoquer un bégaiement. Il ne détecte pas la tension musculaire. 
            Voici les trois marqueurs recherchés :
          </p>
          
          {/* Markers */}
          <div className="space-y-3">
            {/* Block / Long pause */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
              <span className="text-2xl">🟠</span>
              <div>
                <p className="font-medium text-orange-800">Pause longue</p>
                <p className="text-sm text-orange-700">
                  Silence &gt;2 secondes détecté entre deux mots. Cela peut être 
                  une pause de réflexion normale ou un blocage.
                </p>
              </div>
            </div>
            
            {/* Repetition */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-medium text-yellow-800">Répétition (Clonique)</p>
                <p className="text-sm text-yellow-700">
                  Mots identiques répétés rapidement (intervalle &lt;0.2s).
                  Ex: "je-je-je veux"
                </p>
              </div>
            </div>
            
            {/* Prolongation */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <span className="text-2xl">🟣</span>
              <div>
                <p className="font-medium text-purple-800">Allongement (Tonique)</p>
                <p className="text-sm text-purple-700">
                  Durée de prononciation anormalement longue (&gt;0.8s) 
                  sur un mot court.
                </p>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-amber-800">
                Fonctionnalité en test
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>Ne remplace pas l'observation clinique directe.</strong>
                <br />
                Les faux positifs sont possibles (pauses réflexives, hésitations normales, etc.).
                Utilisez cet outil comme un repérage rapide, pas comme un diagnostic.
              </p>
            </div>
          </div>
          
          {/* Method note */}
          <p className="text-xs text-muted-foreground italic">
            Méthode : Analyse des timestamps Deepgram (modèle Nova-2 français).
            Détection basée sur les durées et intervalles acoustiques.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisfluencyInfoModal;
