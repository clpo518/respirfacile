import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  KeyRound, 
  Users, 
  BarChart3, 
  FileText, 
  Bell,
  ChevronRight, 
  ChevronLeft,
  Copy,
  Check,
  PartyPopper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";
import confetti from "canvas-confetti";

interface WelcomeTourModalProps {
  open: boolean;
  onClose: () => void;
  therapistCode?: string;
}

const slides = [
  {
    icon: PartyPopper,
    title: "Bienvenue dans votre espace Pro !",
    description: "Merci de rejoindre ParlerMoinsVite. Vous allez pouvoir suivre vos patients, mesurer leur débit et piloter leur rééducation à distance.",
    visual: "welcome",
    color: "from-primary to-emerald-500",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: KeyRound,
    title: "Votre Code Pro",
    description: "Un code unique vous est attribué (ex: PRO-A1B2C3). Communiquez-le à vos patients pour qu'ils se connectent à votre espace.",
    visual: "code",
    color: "from-primary to-primary/80",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Vos patients s'inscrivent",
    description: "Ils créent un compte et saisissent votre code. Ils apparaissent automatiquement dans votre tableau de bord.",
    visual: "signup",
    color: "from-blue-500 to-indigo-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Suivi en temps réel",
    description: "Visualisez l'activité de chaque patient : exercices réalisés, débit syllabique (SPS), régularité d'entraînement.",
    visual: "tracking",
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Bell,
    title: "Alertes & rétention",
    description: "Identifiez les patients à risque d'abandon. Envoyez des exercices ciblés et des encouragements en un clic.",
    visual: "alerts",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: FileText,
    title: "Bilans automatiques",
    description: "Générez des rapports PDF en un clic avec métriques SPS, évolution, et notes cliniques. Prêts pour vos comptes-rendus.",
    visual: "reports",
    color: "from-purple-500 to-violet-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

const WelcomeTourModal = ({ open, onClose, therapistCode }: WelcomeTourModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (open && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 } }), 300);
      }, 400);
    }
    if (!open) confettiFired.current = false;
  }, [open]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleCopyCode = async () => {
    if (therapistCode) {
      const success = await copyToClipboard(therapistCode);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const renderVisual = () => {
    switch (slide.visual) {
      case "welcome":
        return (
          <div className="bg-muted/50 rounded-xl p-6 border border-border/50 text-center">
            <div className="flex justify-center gap-3 mb-4">
              {["🎉", "🩺", "📊"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-4xl"
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Prêt(e) à transformer le suivi de vos patients ?
            </motion.p>
          </div>
        );
      case "code":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Votre code praticien</p>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-mono font-bold text-primary">
                {therapistCode || "PRO-XXXXXX"}
              </code>
              {therapistCode && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        );
      case "signup":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">M</div>
              <div>
                <p className="text-sm font-medium">Marie D.</p>
                <p className="text-xs text-muted-foreground">Liée il y a 2 min</p>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Nouveau</span>
            </div>
          </div>
        );
      case "tracking":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>SPS moyen</span>
              <span className="text-green-600 font-medium">↑ 12%</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 55, 50, 65, 70, 75, 80].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        );
      case "alerts":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">2 patients inactifs</span>
            </div>
            <p className="text-xs text-muted-foreground">Thomas L. - 5 jours sans session</p>
          </div>
        );
      case "reports":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Bilan_Marie_D.pdf</p>
                <p className="text-xs text-muted-foreground">Généré automatiquement</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${slide.color}`} />
        
        <div className="p-6 sm:p-8">
          <div className="text-center mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Comment ça marche
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${slide.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${slide.iconColor}`} />
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">
                {slide.title}
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base mb-6">
                {slide.description}
              </p>

              {/* Visual element */}
              <div className="mb-6">
                {renderVisual()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? "w-6 bg-primary" 
                    : "w-2 bg-muted hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <Button 
                variant="outline" 
                onClick={handlePrev}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className={`flex-1 gap-1 bg-gradient-to-r ${slide.color} hover:opacity-90 text-white`}
            >
              {currentSlide < slides.length - 1 ? (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                "C'est parti !"
              )}
            </Button>
          </div>

          {/* Skip link */}
          {currentSlide < slides.length - 1 && (
            <button 
              onClick={onClose}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              Passer l'introduction
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTourModal;
