import { useState } from "react";
import { Users, AlertTriangle, HelpCircle, Archive, ChevronDown, ArrowUpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface SeatCounterProps {
  activePatients: number;
  seatsLimit: number;
}

const SeatCounter = ({ activePatients, seatsLimit }: SeatCounterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAtLimit = activePatients >= seatsLimit;
  const percentUsed = Math.min((activePatients / seatsLimit) * 100, 100);
  const remainingSeats = seatsLimit - activePatients;

  return (
    <Card className={`${isAtLimit ? "border-red-500/30 bg-red-500/5" : "border-border"}`}>
      <div 
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users className={`w-5 h-5 ${isAtLimit ? "text-red-500" : "text-muted-foreground"}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              Patients Actifs
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
            <span className={`text-sm font-bold ${isAtLimit ? "text-red-500" : ""}`}>
              {activePatients} / {seatsLimit}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                isAtLimit ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
        {isAtLimit && (
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        )}
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* What is a seat */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Qu'est-ce qu'un "siège" ?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Chaque <strong>siège</strong> représente un patient actif que vous suivez. 
                  Votre offre actuelle vous permet de suivre jusqu'à <strong>{seatsLimit} patients</strong> simultanément.
                </p>
              </div>

              {/* Archiving explanation */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Archive className="w-4 h-4 text-orange-500" />
                  Comment libérer un siège ?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Quand un patient termine sa rééducation, vous pouvez l'<strong>archiver</strong> 
                  (bouton <Archive className="w-3 h-3 inline" /> dans le tableau). Cela libère un siège 
                  tout en conservant son historique. Vous pourrez le restaurer à tout moment.
                </p>
              </div>

              {/* Upgrade hint if at limit */}
              {isAtLimit ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Limite atteinte
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Vous utilisez tous vos sièges. Pour accueillir de nouveaux patients :
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Archivez</strong> un patient inactif pour libérer un siège</li>
                    <li>• Ou <strong>passez à l'offre supérieure</strong> pour plus de capacité</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    ✓ <strong>{remainingSeats} siège{remainingSeats > 1 ? "s" : ""} disponible{remainingSeats > 1 ? "s" : ""}</strong> — Vous pouvez inviter {remainingSeats > 1 ? "de nouveaux patients" : "un nouveau patient"}.
                  </p>
                </div>
              )}

              {/* Upgrade CTA */}
              {seatsLimit < 10 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <ArrowUpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Besoin de plus de patients ?</strong>{" "}
                      <a href="/pro/subscription/manage" className="text-primary hover:underline font-medium">
                        Passer à l'offre supérieure →
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default SeatCounter;
