/**
 * Step 6: Épreuves d'écriture (saisie manuelle)
 * - Copie lente et rapide (texte de Soie — Baricco)
 * - Écriture spontanée sans et avec contrainte temporelle
 * Consignes exactes du protocole Van Zaalen
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { COPY_TEXT, COPY_NORMS_SLOW, COPY_NORMS_FAST, WRITING_NORMS_FREE, WRITING_NORMS_TIMED } from "@/data/batteryNorms";
import { PenLine, Info, Clock, ArrowRight, HelpCircle } from "lucide-react";

export interface WritingData {
  copySlowErrors: number;
  copySlowTelescopages: number;
  copySlowSpeed: number;
  copyFastErrors: number;
  copyFastTelescopages: number;
  copyFastSpeed: number;
  graphismSize: 'small' | 'normal' | 'large';
  writingFreeErrors: number;
  writingFreeTelescopages: number;
  writingFreeSyntaxErrors: number;
  writingTimedErrors: number;
  writingTimedTelescopages: number;
  writingTimedSyntaxErrors: number;
}

interface Props {
  onComplete: (data: WritingData) => void;
  initialData?: WritingData;
}

const ClinicianBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
    ✏️ À remplir par le clinicien
  </span>
);

const WritingStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [data, setData] = useState<WritingData>(initialData || {
    copySlowErrors: 0, copySlowTelescopages: 0, copySlowSpeed: 0,
    copyFastErrors: 0, copyFastTelescopages: 0, copyFastSpeed: 0,
    graphismSize: 'normal',
    writingFreeErrors: 0, writingFreeTelescopages: 0, writingFreeSyntaxErrors: 0,
    writingTimedErrors: 0, writingTimedTelescopages: 0, writingTimedSyntaxErrors: 0,
  });

  const update = (key: keyof WritingData, value: string | number) => {
    setData(prev => ({ ...prev, [key]: typeof value === 'string' && key !== 'graphismSize' ? (parseInt(value) || 0) : value }));
  };

  const updateFloat = (key: keyof WritingData, value: string) => {
    setData(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Consigne patient */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Ce que vous allez faire :</p>
            <div className="text-muted-foreground text-xs space-y-1 mt-1">
              <p>1. <strong>Copie lente</strong> : Recopiez le texte ci-dessous à votre rythme habituel.</p>
              <p>2. <strong>Copie rapide</strong> : Recopiez le même texte le plus vite possible.</p>
              <p>3. <strong>Écriture libre</strong> : Écrivez environ 10 lignes sur le sujet de votre choix.</p>
              <p>4. <strong>Écriture chronométrée</strong> : Même exercice, en 5 minutes maximum.</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Prenez du papier et un stylo. Votre orthophoniste vous guidera pour chaque étape.
            </p>
          </div>
        </div>
      </div>

      {/* Copy text reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Texte de copie — « Soie » (Baricco, 1996)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 rounded-lg p-4 italic">{COPY_TEXT}</p>
        </CardContent>
      </Card>

      {/* Copie lente */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1"><ClinicianBadge /></div>
          <CardTitle className="text-base">Copie lente</CardTitle>
          <CardDescription>
            « Recopiez ce texte à votre rythme habituel, comme si vous preniez des notes. »
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-xs flex items-center gap-1 cursor-help">Corrections <HelpCircle className="w-3 h-3" /></Label>
                </TooltipTrigger>
                <TooltipContent>Nombre de mots que le patient a corrigés/barrés</TooltipContent>
              </Tooltip>
              <Input type="number" value={data.copySlowErrors || ''} onChange={e => update('copySlowErrors', e.target.value)}
                placeholder={COPY_NORMS_SLOW.variables[0].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-xs flex items-center gap-1 cursor-help">Télescopages <HelpCircle className="w-3 h-3" /></Label>
                </TooltipTrigger>
                <TooltipContent>Fusions de lettres ou de mots (omission de lettres/syllabes)</TooltipContent>
              </Tooltip>
              <Input type="number" value={data.copySlowTelescopages || ''} onChange={e => update('copySlowTelescopages', e.target.value)}
                placeholder={COPY_NORMS_SLOW.variables[1].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Vitesse (car/sec)</Label>
              <Input type="number" step="0.01" value={data.copySlowSpeed || ''} onChange={e => updateFloat('copySlowSpeed', e.target.value)}
                placeholder="—" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copie rapide */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1"><ClinicianBadge /></div>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> Copie rapide
          </CardTitle>
          <CardDescription>
            « Recopiez le même texte le plus vite possible, sans vous soucier de la propreté. »
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Corrections</Label>
              <Input type="number" value={data.copyFastErrors || ''} onChange={e => update('copyFastErrors', e.target.value)}
                placeholder={COPY_NORMS_FAST.variables[0].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Télescopages</Label>
              <Input type="number" value={data.copyFastTelescopages || ''} onChange={e => update('copyFastTelescopages', e.target.value)}
                placeholder={COPY_NORMS_FAST.variables[1].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Vitesse (car/sec)</Label>
              <Input type="number" step="0.01" value={data.copyFastSpeed || ''} onChange={e => updateFloat('copyFastSpeed', e.target.value)}
                placeholder="—" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taille du graphisme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observation du graphisme</CardTitle>
          <CardDescription>Évaluez la taille générale de l'écriture manuscrite du patient</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={data.graphismSize} onValueChange={(v) => setData(prev => ({ ...prev, graphismSize: v as any }))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit (micrographie)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Grand (macrographie)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Écriture spontanée sans contrainte */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1"><ClinicianBadge /></div>
          <CardTitle className="text-base">Écriture spontanée — sans contrainte</CardTitle>
          <CardDescription>
            « Écrivez environ 10 lignes sur le sujet de votre choix (vacances, loisirs, week-end…). Prenez le temps que vous souhaitez. »
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Corrections</Label>
              <Input type="number" value={data.writingFreeErrors || ''} onChange={e => update('writingFreeErrors', e.target.value)}
                placeholder={WRITING_NORMS_FREE.variables[0].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Télescopages</Label>
              <Input type="number" value={data.writingFreeTelescopages || ''} onChange={e => update('writingFreeTelescopages', e.target.value)}
                className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Err. syntaxe</Label>
              <Input type="number" value={data.writingFreeSyntaxErrors || ''} onChange={e => update('writingFreeSyntaxErrors', e.target.value)}
                className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Écriture spontanée avec contrainte */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1"><ClinicianBadge /></div>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> Écriture spontanée — avec contrainte (5 min)
          </CardTitle>
          <CardDescription>
            « Même exercice, mais cette fois vous avez 5 minutes maximum. Écrivez environ 10 lignes. »
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Corrections</Label>
              <Input type="number" value={data.writingTimedErrors || ''} onChange={e => update('writingTimedErrors', e.target.value)}
                placeholder={WRITING_NORMS_TIMED.variables[0].mean.toFixed(1)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Télescopages</Label>
              <Input type="number" value={data.writingTimedTelescopages || ''} onChange={e => update('writingTimedTelescopages', e.target.value)}
                className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Err. syntaxe</Label>
              <Input type="number" value={data.writingTimedSyntaxErrors || ''} onChange={e => update('writingTimedSyntaxErrors', e.target.value)}
                className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={() => onComplete(data)} className="w-full gap-2 shadow-lg" size="lg">
          Voir les résultats <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default WritingStep;
