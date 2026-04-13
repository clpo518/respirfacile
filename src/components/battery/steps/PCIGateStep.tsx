/**
 * Step 1: Questionnaire PCI (Predictive Cluttering Inventory)
 * 10 items × échelle 0-5, seuil > 24
 * L'orthophoniste cote — le patient ne voit pas cet écran seul
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PCI_ITEMS, PCI_THRESHOLD } from "@/data/batteryNorms";
import { AlertTriangle, CheckCircle, ArrowRight, Clipboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PCIGateData {
  pciScores: number[];
  pciTotal: number;
  shouldContinue: boolean;
}

interface Props {
  onComplete: (data: PCIGateData) => void;
  initialData?: PCIGateData;
}

const SCALE_LABELS = ['Absent', 'Rare', 'Parfois', 'Souvent', 'Très souvent', 'Toujours'];

const PCIGateStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [pciScores, setPciScores] = useState<(number | null)[]>(
    initialData?.pciScores || new Array(10).fill(null)
  );

  const allAnswered = pciScores.every(s => s !== null);
  const pciTotal = pciScores.reduce<number>((a, b) => a + (b ?? 0), 0);
  const isAboveThreshold = allAnswered && pciTotal > PCI_THRESHOLD;

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...pciScores];
    newScores[index] = value;
    setPciScores(newScores);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Clipboard className="w-3.5 h-3.5" />
          Étape 1 sur 8
        </div>
        <h3 className="text-xl font-bold">Inventaire Prédictif du Bredouillement</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cotez chaque comportement observé chez le patient. Ce questionnaire (PCI) détermine
          si la batterie complète est indiquée.
        </p>
      </div>

      {/* Progress indicator */}
      {!allAnswered && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {pciScores.filter(s => s !== null).length} / {pciScores.length} questions répondues
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(pciScores.filter(s => s !== null).length / pciScores.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Score — only when all answered */}
      {allAnswered && (
        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
          isAboveThreshold 
            ? 'border-destructive/40 bg-destructive/5' 
            : 'border-primary/30 bg-primary/5'
        }`}>
          <div>
            <div className="text-3xl font-bold tabular-nums">
              {pciTotal}<span className="text-base text-muted-foreground font-normal ml-1">/ 50</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Seuil d'indication : &gt; 24
            </div>
          </div>
          <div>
            {isAboveThreshold ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Bredouillement possible
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-primary border-primary/20">
                <CheckCircle className="w-3 h-3" />
                Sous le seuil
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* PCI items — clean button-based scoring */}
      <div className="space-y-3">
        {PCI_ITEMS.map((item, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                {item}
              </p>
              <div className="flex gap-1.5">
                {SCALE_LABELS.map((label, val) => {
                  const isSelected = pciScores[i] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleScoreChange(i, val)}
                      className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                      }`}
                      title={label}
                    >
                      <div className="text-center">
                        <div className={`text-base font-bold ${isSelected ? '' : 'text-foreground'}`}>{val}</div>
                        <div className="hidden sm:block text-[10px] leading-tight mt-0.5 truncate">{label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sticky action — only when all answered */}
      {allAnswered && (
        <div className="sticky bottom-4 z-10">
          <div className="bg-background/95 backdrop-blur rounded-xl border shadow-lg p-4 space-y-3">
            {isAboveThreshold ? (
              <p className="text-sm text-center text-muted-foreground">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-destructive" />
                Score au-dessus du seuil — la batterie complète est recommandée.
              </p>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-primary" />
                  Score sous le seuil ({pciTotal}/50) — pas d'indication forte de bredouillement.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Vous pouvez conclure avec un mini-rapport PCI, ou poursuivre la batterie complète si cliniquement pertinent.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {!isAboveThreshold && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onComplete({ pciScores: pciScores.map(s => s ?? 0), pciTotal, shouldContinue: false })}
                >
                  Conclure — mini-rapport PCI
                </Button>
              )}
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={() => onComplete({ pciScores: pciScores.map(s => s ?? 0), pciTotal, shouldContinue: true })}
              >
                {isAboveThreshold ? 'Continuer l\'évaluation' : 'Poursuivre quand même'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCIGateStep;
