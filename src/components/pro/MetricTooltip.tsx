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
  SPS: "Score de séance — Mesure la qualité et la régularité respiratoire sur l'ensemble de l'exercice. Cible thérapeutique : ≤ 4.5 pts",
  AVG_SPS: "Score moyen de la séance, calculé sur l'ensemble des cycles respiratoires. ≤4.5 = optimal, 4.5-6 = à améliorer, >6 = à travailler",
  MAX_SPS: "Score maximal atteint pendant la séance. Un écart important avec la moyenne peut indiquer une irrégularité respiratoire à travailler",
  FLUENCY_RATIO: "Pourcentage de la séance réalisée en continuité. > 80% = excellent, 60-80% = normal, < 60% = à surveiller",
  FILLERS: "Mots d'appui : 'euh', 'du coup', 'en fait' détectés automatiquement pendant la session",
  SYLLABLES: "Nombre total de cycles respiratoires complétés pendant la séance",
} as const;
