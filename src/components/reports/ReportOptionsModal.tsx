/**
 * Report Options Modal
 * 
 * Allows therapist to customize the report before generation (PDF or Text)
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileText, FileType, Loader2 } from "lucide-react";
import { ReportOptions } from "@/lib/clinicalReportAnalysis";
import { cn } from "@/lib/utils";

export type ReportFormat = "pdf" | "text";

interface ReportOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: ReportOptions, format: ReportFormat) => void;
  isGenerating: boolean;
  patientName: string;
}

const ReportOptionsModal: React.FC<ReportOptionsModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  patientName,
}) => {
  const [recipientDoctor, setRecipientDoctor] = React.useState("");
  const [therapistNotes, setTherapistNotes] = React.useState("");
  const [includeEvolutionChart, setIncludeEvolutionChart] = React.useState(true);
  const [format, setFormat] = React.useState<ReportFormat>("pdf");

  const handleGenerate = () => {
    onGenerate(
      {
        recipientDoctor: recipientDoctor.trim() || undefined,
        therapistNotes: therapistNotes.trim() || undefined,
        includeEvolutionChart,
      },
      format
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Personnaliser le Bilan
          </DialogTitle>
          <DialogDescription>
            Ajoutez des informations optionnelles avant de générer le bilan pour{" "}
            <span className="font-medium text-foreground">{patientName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selector */}
          <div className="grid gap-2">
            <Label>Format d'export</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs opacity-70">Mise en page pro</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat("text")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                  format === "text"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <FileType className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Texte</div>
                  <div className="text-xs opacity-70">Copier-coller facile</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recipient Doctor */}
          <div className="grid gap-2">
            <Label htmlFor="recipient">À l'attention de (optionnel)</Label>
            <Input
              id="recipient"
              placeholder="Dr. Martin, médecin traitant"
              value={recipientDoctor}
              onChange={(e) => setRecipientDoctor(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sera affiché en en-tête du document si renseigné
            </p>
          </div>

          {/* Therapist Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Observations cliniques (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Observations personnelles à inclure dans le bilan...&#10;&#10;Exemple : Patient coopérant, bonne conscience du trouble. Travail en cours sur les stratégies de ralentissement."
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ces notes seront ajoutées dans une section "Observations du praticien"
            </p>
          </div>

          {/* Include Chart Toggle - only for PDF */}
          {format === "pdf" && (
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="include-chart">Graphique d'évolution</Label>
                <p className="text-xs text-muted-foreground">
                  Inclure la courbe de progression dans le PDF
                </p>
              </div>
              <Switch
                id="include-chart"
                checked={includeEvolutionChart}
                onCheckedChange={setIncludeEvolutionChart}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                {format === "pdf" ? <FileText className="w-4 h-4" /> : <FileType className="w-4 h-4" />}
                Générer le {format === "pdf" ? "PDF" : "Texte"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportOptionsModal;
