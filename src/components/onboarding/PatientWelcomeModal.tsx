import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Target, 
  TrendingUp, 
  Award,
  Stethoscope,
  ChevronRight, 
  ChevronLeft,
  PartyPopper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface PatientWelcomeModalProps {
  open: boolean;
  onClose: () => void;
  patientName?: string;
  hasTherapist?: boolean;
}

const allSlides = [
  {
    icon: PartyPopper,
    title: "Bienvenue sur ParlerMoinsVite !",
    description: "Merci de nous faire confiance. Vous allez découvrir un outil conçu pour vous aider à maîtriser votre débit de parole, à votre rythme.",
    visual: "welcome",
    color: "from-primary to-emerald-500",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    requiresTherapist: false,
  },
  {
    icon: Target,
    title: "Votre objectif personnalisé",
    description: "En fonction de votre âge, l'application calcule automatiquement votre vitesse de parole cible. Pas de comparaison inutile !",
    visual: "target",
    color: "from-primary to-primary/80",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    requiresTherapist: false,
  },
  {
    icon: Mic,
    title: "Entraînez-vous chaque jour",
    description: "5 à 10 minutes suffisent. Lisez à voix haute, l'application mesure votre débit en temps réel et vous guide.",
    visual: "practice",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    requiresTherapist: false,
  },
  {
    icon: TrendingUp,
    title: "Visualisez vos progrès",
    description: "Courbes d'évolution, séries d'entraînement, scores... Tout est là pour vous motiver à continuer.",
    visual: "progress",
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    requiresTherapist: false,
  },
  {
    icon: Stethoscope,
    title: "Votre orthophoniste vous suit",
    description: "Vos sessions sont partagées avec votre praticien(e). Il/elle peut vous envoyer des exercices ciblés et des encouragements.",
    visual: "therapist",
    color: "from-purple-500 to-violet-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    requiresTherapist: true,
  },
  {
    icon: Award,
    title: "Prêt(e) à commencer ?",
    description: "La régularité est la clé. Même 5 minutes par jour font la différence. Lancez votre premier exercice !",
    visual: "ready",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    requiresTherapist: false,
  },
];

const PatientWelcomeModal = ({ open, onClose, patientName, hasTherapist = false }: PatientWelcomeModalProps) => {
  const slides = allSlides.filter(s => !s.requiresTherapist || hasTherapist);
  const [currentSlide, setCurrentSlide] = useState(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (open && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { y: 0.5 } }), 300);
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

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const renderVisual = () => {
    switch (slide.visual) {
      case "welcome":
        return (
          <div className="bg-muted/50 rounded-xl p-6 border border-border/50 text-center">
            <div className="flex justify-center gap-3 mb-4">
              {["🎉", "🗣️", "🚀"].map((emoji, i) => (
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
              {patientName ? `${patientName}, l'aventure commence !` : "Votre aventure commence maintenant !"}
            </motion.p>
          </div>
        );
      case "target":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Votre objectif</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Personnalisé</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">4.2</span>
              <span className="text-sm text-muted-foreground">syllabes/sec</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Adapté à votre tranche d'âge</p>
          </div>
        );
      case "practice":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Mic className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-500 to-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Analyse en temps réel...</p>
              </div>
            </div>
          </div>
        );
      case "progress":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Cette semaine</span>
              <span className="text-xs text-green-600 font-medium">+15%</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[30, 45, 40, 55, 60, 70, 75].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Lun</span>
              <span>Dim</span>
            </div>
          </div>
        );
      case "therapist":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau message</p>
                <p className="text-xs text-muted-foreground mt-1">
                  "Bravo pour ta régularité ! Continue comme ça 💪"
                </p>
              </div>
            </div>
          </div>
        );
      case "ready":
        return (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-center">
            <div className="flex justify-center gap-2 mb-3">
              {["🎯", "📈", "🏆"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Votre parcours commence maintenant
            </p>
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
                "Commencer mon entraînement"
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

export default PatientWelcomeModal;
