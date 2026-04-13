/**
 * Step 4: Reformulation d'histoire entendue (L'histoire du porte-monnaie)
 * L'ortho lit l'histoire, le patient la reformule
 * Cotation : items principaux/secondaires rappelés avec mots-clés acceptés,
 * additions, disfluences détaillées, syntaxe, VA sur 5 échantillons
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, ChevronDown, ChevronUp, Info, ArrowRight } from "lucide-react";
import {
  RETELLING_STORY_TEXT,
  RETELLING_MAIN_ITEMS,
  RETELLING_SECONDARY_ITEMS,
  RETELLING_NORMS,
  DISFLUENCY_TYPES,
} from "@/data/batteryNorms";
import BatteryRecorder from "../BatteryRecorder";
import type { BatteryDisfluencyResult } from "@/lib/batteryDisfluencyDetection";

export interface RetellingData {
  mainItemsRecalled: boolean[];
  secondaryItemsRecalled: boolean[];
  mainCount: number;
  secondaryCount: number;
  additions: number;
  normalDisfluencies: number;
  telescopages: number;
  stutteringDisfluencies: number;
  syntaxErrors: number;
  articulationRate: number;
  variability: number;
  samples: number[];
  disfluencyDetails: Record<string, number>;
  audioBlob?: Blob;
}

interface Props {
  onComplete: (data: RetellingData) => void;
  initialData?: RetellingData;
}

const RetellingStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [hasRecording, setHasRecording] = useState(!!initialData?.samples?.some((s: number) => s > 0));
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [showStory, setShowStory] = useState(true);
  const [mainItems, setMainItems] = useState<boolean[]>(initialData?.mainItemsRecalled || new Array(RETELLING_MAIN_ITEMS.length).fill(false));
  const [secondaryItems, setSecondaryItems] = useState<boolean[]>(initialData?.secondaryItemsRecalled || new Array(RETELLING_SECONDARY_ITEMS.length).fill(false));
  const [additions, setAdditions] = useState(initialData?.additions?.toString() || '0');
  const [syntaxErr, setSyntaxErr] = useState(initialData?.syntaxErrors?.toString() || '');
  const [samples, setSamples] = useState<number[]>(initialData?.samples || [0, 0, 0, 0, 0]);
  const [disfluencyDetails, setDisfluencyDetails] = useState<Record<string, number>>(
    initialData?.disfluencyDetails || Object.fromEntries(DISFLUENCY_TYPES.map(d => [d.key, 0]))
  );

  const handleDisfluenciesDetected = (result: BatteryDisfluencyResult) => {
    setDisfluencyDetails(prev => {
      const merged = { ...prev };
      for (const [key, val] of Object.entries(result.disfluencyDetails)) {
        if (val > 0) merged[key] = val;
      }
      return merged;
    });
  };

  const mainCount = mainItems.filter(Boolean).length;
  const secondaryCount = secondaryItems.filter(Boolean).length;

  const updateSample = (idx: number, val: string) => {
    const copy = [...samples];
    copy[idx] = parseFloat(val) || 0;
    setSamples(copy);
  };

  const nonZeroSamples = samples.filter(s => s > 0);
  const avgRate = nonZeroSamples.length > 0
    ? nonZeroSamples.reduce((a, b) => a + b, 0) / nonZeroSamples.length
    : 0;
  const variability = nonZeroSamples.length > 1
    ? Math.max(...nonZeroSamples) - Math.min(...nonZeroSamples)
    : 0;

  const normalDisf = DISFLUENCY_TYPES
    .filter(d => d.category === 'normal')
    .reduce((sum, d) => sum + (disfluencyDetails[d.key] || 0), 0);
  const telescopages = disfluencyDetails['telescopage'] || 0;
  const stuttDisf = DISFLUENCY_TYPES
    .filter(d => d.category === 'stuttering')
    .reduce((sum, d) => sum + (disfluencyDetails[d.key] || 0), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Story to read */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowStory(!showStory)}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Histoire (pour l'orthophoniste)</span>
            {showStory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {showStory && (
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-line italic bg-muted/50 rounded-lg p-4">{RETELLING_STORY_TEXT}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Ce que vous allez faire :</p>
                  <p className="text-muted-foreground mt-1">
                    Votre orthophoniste va vous raconter une histoire. Écoutez attentivement, puis vous la redirez avec vos propres mots.
                    Ce n'est pas une épreuve de mémoire — racontez simplement ce dont vous vous souvenez.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    ℹ️ L'histoire est lue une seule fois. Ensuite, l'enregistrement démarre et c'est à vous.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recording */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enregistrement de la reformulation</CardTitle>
        </CardHeader>
        <CardContent>
          <BatteryRecorder onRecordingComplete={(blob) => { setHasRecording(true); setAudioBlob(blob); }} autoDetectDisfluencies onDisfluenciesDetected={handleDisfluenciesDetected} />
        </CardContent>
      </Card>

      {/* Items recalled — Main */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Items rappelés — Principaux ({mainCount}/{RETELLING_MAIN_ITEMS.length})</CardTitle>
          <CardDescription>
            Cochez chaque idée rappelée. Les synonymes et reformulations sont acceptés.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {RETELLING_MAIN_ITEMS.map((item, i) => (
            <label key={i} className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded-lg transition-colors ${
              mainItems[i] ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
            }`}>
              <Checkbox
                checked={mainItems[i]}
                onCheckedChange={() => {
                  const copy = [...mainItems];
                  copy[i] = !copy[i];
                  setMainItems(copy);
                }}
                className="mt-0.5"
              />
              <div>
                <span className={mainItems[i] ? 'text-foreground' : 'text-muted-foreground'}>
                  <strong>{item.index}.</strong> {item.text}
                </span>
                {item.accepted && (
                  <span className="block text-xs text-muted-foreground/70 mt-0.5">
                    ✓ Accepté aussi : {item.accepted}
                  </span>
                )}
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Items recalled — Secondary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Items rappelés — Secondaires ({secondaryCount}/{RETELLING_SECONDARY_ITEMS.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RETELLING_SECONDARY_ITEMS.map((item, i) => (
            <label key={i} className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded-lg transition-colors ${
              secondaryItems[i] ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
            }`}>
              <Checkbox
                checked={secondaryItems[i]}
                onCheckedChange={() => {
                  const copy = [...secondaryItems];
                  copy[i] = !copy[i];
                  setSecondaryItems(copy);
                }}
                className="mt-0.5"
              />
              <div>
                <span className={secondaryItems[i] ? 'text-foreground' : 'text-muted-foreground'}>
                  <strong>S{item.index}.</strong> {item.text}
                </span>
                {item.accepted && (
                  <span className="block text-xs text-muted-foreground/70 mt-0.5">
                    ✓ Accepté aussi : {item.accepted}
                  </span>
                )}
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Clinician sections — only after recording */}
      {hasRecording && (
        <>
          {/* 5 samples grid */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                  ✏️ Cotation orthophoniste
                </span>
              </div>
              <CardTitle className="text-base">Vitesse articulatoire — 5 échantillons</CardTitle>
              <CardDescription>
                Réécouter l'enregistrement, repérer 5 segments de 10 syllabes consécutives et chronométrer chacun.
                VA = 10 / temps (en secondes).
                <br />
                <span className="text-xs">
                  Norme : {RETELLING_NORMS.variables[0].mean.toFixed(2)} ± {RETELLING_NORMS.variables[0].sd.toFixed(2)} SPS
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {samples.map((s, i) => (
                  <div key={i}>
                    <Label className="text-xs text-center block mb-1">Éch. {i + 1}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={s || ''}
                      onChange={e => updateSample(i, e.target.value)}
                      placeholder="SPS"
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted-foreground">
                  VA moyenne : <strong>{avgRate > 0 ? avgRate.toFixed(2) : '—'} SPS</strong>
                </span>
                <span className="text-muted-foreground">
                  Variabilité : <strong className={variability > 3 ? 'text-destructive' : ''}>
                    {variability > 0 ? variability.toFixed(2) : '—'} SPS
                  </strong>
                  {variability > 3 && <span className="text-destructive text-xs ml-1">({'>'} 3 = atypique)</span>}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Disfluency grid */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                  ✏️ Cotation orthophoniste
                </span>
              </div>
              <CardTitle className="text-base">Disfluences observées</CardTitle>
              <CardDescription>Comptez chaque type de disfluence dans la reformulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {DISFLUENCY_TYPES.map(d => (
                  <div key={d.key} className="flex items-center gap-2">
                    <Label className="text-xs flex-1">
                      {d.label}
                      <span className={`ml-1 text-xs ${
                        d.category === 'normal' ? 'text-blue-500' :
                        d.category === 'cluttering' ? 'text-orange-500' : 'text-destructive'
                      }`}>
                        ({d.category === 'normal' ? 'N' : d.category === 'cluttering' ? 'B' : 'Bè'})
                      </span>
                    </Label>
                    <Input
                      type="number"
                      className="w-16 text-center"
                      value={disfluencyDetails[d.key] || ''}
                      onChange={e => setDisfluencyDetails(prev => ({
                        ...prev, [d.key]: parseInt(e.target.value) || 0
                      }))}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>N = Normales ({normalDisf})</span>
                <span>B = Télescopages ({telescopages})</span>
                <span>Bè = Bègues ({stuttDisf})</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional counts */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                  ✏️ Cotation orthophoniste
                </span>
              </div>
              <CardTitle className="text-base">Mesures complémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Erreurs syntaxiques</Label>
                  <Input type="number" value={syntaxErr} onChange={e => setSyntaxErr(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs">Additions (éléments inventés)</Label>
                  <Input type="number" value={additions} onChange={e => setAdditions(e.target.value)} placeholder="0" />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={() => onComplete({
          mainItemsRecalled: mainItems,
          secondaryItemsRecalled: secondaryItems,
          mainCount,
          secondaryCount,
          additions: parseInt(additions) || 0,
          normalDisfluencies: normalDisf,
          telescopages,
          stutteringDisfluencies: stuttDisf,
          syntaxErrors: parseInt(syntaxErr) || 0,
          articulationRate: avgRate,
          variability,
          samples,
          disfluencyDetails,
          audioBlob,
        })} className="w-full gap-2 shadow-lg" size="lg">
          Étape suivante — Lecture à voix haute <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RetellingStep;
