import { Clock, ArrowRight, AlertTriangle, Shield, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  daysRemaining: number;
  activePatients?: number;
  totalSessions?: number;
}

const TrialBanner = ({ daysRemaining, activePatients = 0, totalSessions = 0 }: TrialBannerProps) => {
  const navigate = useNavigate();

  const isUrgent = daysRemaining <= 7;
  const isModerate = daysRemaining > 7 && daysRemaining <= 14;
  const hasData = activePatients > 0 || totalSessions > 0;

  const elapsed = Math.min(30, 30 - daysRemaining);
  const progressPercent = (elapsed / 30) * 100;

  const getMessage = () => {
    if (daysRemaining <= 3 && hasData) {
      return `Fin d'essai — vos ${activePatients} patient${activePatients > 1 ? 's' : ''} n'auront plus accès aux exercices`;
    }
    if (daysRemaining <= 3) {
      return "Fin d'essai — vos patients perdront l'accès aux exercices";
    }
    if (isUrgent && hasData) {
      return `Essai gratuit · ${activePatients} patient${activePatients > 1 ? 's' : ''} actif${activePatients > 1 ? 's' : ''}, ${totalSessions} séance${totalSessions > 1 ? 's' : ''} enregistrée${totalSessions > 1 ? 's' : ''}`;
    }
    if (isUrgent) {
      return "Votre essai gratuit touche à sa fin";
    }
    if (isModerate && hasData) {
      return `Essai gratuit · ${activePatients} patient${activePatients > 1 ? 's' : ''}, ${totalSessions} séance${totalSessions > 1 ? 's' : ''} enregistrée${totalSessions > 1 ? 's' : ''}`;
    }
    if (isModerate) {
      return "Essai gratuit en cours";
    }
    return "Bienvenue dans votre essai gratuit";
  };

  const getCtaLabel = () => {
    if (daysRemaining <= 3) return "Sécuriser l'accès";
    if (isUrgent) return "Choisir mon offre";
    return "Voir les offres";
  };

  const Icon = isUrgent ? AlertTriangle : Clock;

  return (
    <div
      className={`border-b sticky top-0 z-[60] transition-colors ${
        isUrgent
          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
          : "bg-muted/80 border-border"
      }`}
    >
      <div className="container mx-auto px-4 py-2.5">
        {/* Mobile: 2 lignes */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isUrgent ? "bg-amber-500/20" : "bg-primary/10"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isUrgent ? "text-amber-600 dark:text-amber-400" : "text-primary"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground leading-snug">
                {getMessage()}
              </p>
              <p className={`text-sm font-semibold ${
                isUrgent ? "text-amber-700 dark:text-amber-300" : "text-foreground"
              }`}>
                {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant{daysRemaining > 1 ? "s" : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant={isUrgent ? "default" : "ghost"}
              onClick={() => navigate("/pro/subscription")}
              className={`gap-1 shrink-0 text-xs px-2.5 ${
                !isUrgent ? "text-primary hover:text-primary" : ""
              }`}
            >
              {getCtaLabel()}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Desktop: 1 ligne */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isUrgent ? "bg-amber-500/20" : "bg-primary/10"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isUrgent ? "text-amber-600 dark:text-amber-400" : "text-primary"
                }`}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {getMessage()}
              {" · "}
              <span
                className={`font-semibold ${
                  isUrgent ? "text-amber-700 dark:text-amber-300" : "text-foreground"
                }`}
              >
                {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant{daysRemaining > 1 ? "s" : ""}
              </span>
            </p>
            <div className="hidden md:flex items-center w-24 shrink-0">
              <Progress
                value={progressPercent}
                className={`h-1.5 ${isUrgent ? "[&>div]:bg-amber-500" : ""}`}
              />
            </div>
          </div>
          <Button
            size="sm"
            variant={isUrgent ? "default" : "ghost"}
            onClick={() => navigate("/pro/subscription")}
            className={`gap-1.5 shrink-0 ${
              !isUrgent ? "text-primary hover:text-primary" : ""
            }`}
          >
            {daysRemaining <= 3 && <Shield className="w-3.5 h-3.5" />}
            {getCtaLabel()}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;
