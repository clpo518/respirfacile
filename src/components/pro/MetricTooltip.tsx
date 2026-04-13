import { ReactNode, useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MetricTooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export const MetricTooltip = ({ children, content, className = "" }: MetricTooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 cursor-help ${className}`}
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="max-w-xs text-sm p-3"
        side="top"
        onPointerDownOutside={() => setOpen(false)}
      >
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  );
};

// Pre-defined tooltips for common metrics
export const METRIC_TOOLTIPS = {
  SPS: "Syllabes par seconde — Calculé par paquets de 5 syllabes sur le temps de parole réel (silences exclus). Cible thérapeutique : 3.5-5.5 SPS",
  AVG_SPS: "Vitesse moyenne de la session en Syllabes Par Seconde, calculée par paquets de 5 syllabes. ≤5.0 = optimal, 5-6 = rapide, >6.5 = tachylalie",
  MAX_SPS: "Accélération max atteinte pendant la session. Un écart important avec la moyenne peut indiquer des accélérations involontaires (typique du bredouillement)",
  FLUENCY_RATIO: "Pourcentage du temps passé à parler vs en silence. > 80% = excellent, 60-80% = normal, < 60% = à surveiller",
  FILLERS: "Disfluences : 'euh', 'du coup', 'en fait' (mots d'appui) détectés automatiquement pendant la session",
  SYLLABLES: "Nombre total de syllabes prononcées, calculé avec un algorithme optimisé pour le français (gestion des 'e' muets)",
} as const;
