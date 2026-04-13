/**
 * Optional free-text observations field shown at bottom of each step
 */
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, FileText } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  stepLabel: string;
}

const StepObservations: React.FC<Props> = ({ value, onChange, stepLabel }) => {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Observations cliniques — {stepLabel}
        </span>
        <span className="text-xs text-muted-foreground/60">(optionnel)</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FileText className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              Ces notes seront incluses dans le rapport PDF final.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Notes qualitatives : comportement du patient, fatigue, auto-corrections, remarques…"
        className="min-h-[80px] text-sm resize-y"
      />
    </div>
  );
};

export default StepObservations;
