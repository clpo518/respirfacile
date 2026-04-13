/**
 * Step 5: Lecture à voix haute — Extrait de "Pierrot" de Maupassant
 * Consigne : lecture directe sans préparation préalable
 * Mesures : VA sur 5 échantillons de 10 syllabes, variabilité, disfluences
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { READING_TEXT, READING_NORMS, READING_TEXT_SYLLABLES, DISFLUENCY_TYPES } from "@/data/batteryNorms";

import BatteryRecorder from "../BatteryRecorder";
import { Info, BookOpen, ArrowRight } from "lucide-react";
import type { BatteryDisfluencyResult } from "@/lib/batteryDisfluencyDetection";

export interface ReadingData {
  articulationRate: number;
  variability: number;
  samples: number[];
  normalDisfluencies: number;
  telescopages: number;
  stutteringDisfluencies: number;
  disfluencyDetails: Record<string, number>;
  audioBlob?: Blob;
}

interface Props {
  onComplete: (data: ReadingData) => void;
  initialData?: ReadingData;
}

const ReadingStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [hasRecording, setHasRecording] = useState(!!initialData?.samples?.some((s: number) => s > 0));
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [samples, setSamples] = useState<number[]>(initialData?.samples || [0, 0, 0, 0, 0]);
  const [disfluencyDetails, setDisfluencyDetails] = useState<Record<string, number>>(
    initialData?.disfluencyDetails || Object.fromEntries(DISFLUENCY_TYPES.map(d => [d.key, 0]))
  );

  const handleRecording = (blob: Blob, durationSeconds: number) => {
    setHasRecording(true);
    setAudioBlob(blob);
    // Pre-fill VA samples with estimated SPS from known syllable count / duration
    if (durationSeconds > 0 && samples.every(s => s === 0)) {
      const estimatedSPS = parseFloat((READING_TEXT_SYLLABLES / durationSeconds).toFixed(2));
      setSamples([estimatedSPS, estimatedSPS, estimatedSPS, estimatedSPS, estimatedSPS]);
    }
  };

  const handleDisfluenciesDetected = (result: BatteryDisfluencyResult) => {
    // Merge disfluency details
    setDisfluencyDetails(prev => {
      const merged = { ...prev };
      for (const [key, val] of Object.entries(result.disfluencyDetails)) {
        if (val > 0) merged[key] = val;
      }
      return merged;
    });
    // Pre-fill VA samples from the unified engine (speechRateTimeline)
    if (result.vaSamples && result.vaSamples.some(s => s > 0)) {
      setSamples(result.vaSamples);
    }
  };

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

  const norm = READING_NORMS.variables[0];

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
            <p className="text-muted-foreground mt-1">
              Lisez le texte ci-dessous à voix haute, à votre rythme habituel.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ Ne lisez pas le texte silencieusement avant — découvrez-le en le lisant directement à voix haute.
            </p>
          </div>
        </div>
      </div>

      {/* Text to read */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Texte à lire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/50 rounded-lg p-4 font-serif">
            {READING_TEXT}
          </div>
        </CardContent>
      </Card>

      {/* Recording */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enregistrement</CardTitle>
        </CardHeader>
        <CardContent>
          <BatteryRecorder onRecordingComplete={handleRecording} autoDetectDisfluencies onDisfluenciesDetected={handleDisfluenciesDetected} />
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
                <span className="text-[10px] text-muted-foreground italic">Pré-rempli — ajustez après réécoute</span>
              </div>
              <CardTitle className="text-base">Vitesse articulatoire — 5 échantillons</CardTitle>
              <CardDescription>
                Réécouter l'enregistrement, repérer 5 segments de 10 syllabes consécutives et chronométrer chacun.
                Saisir la VA = 10 / temps (en secondes).
                <br />
                <span className="text-xs">Norme adulte : {norm.mean.toFixed(2)} ± {norm.sd.toFixed(2)} SPS</span>
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
                  Variabilité (max-min) : <strong className={variability > 3 ? 'text-destructive' : ''}>
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
              <CardDescription>Comptez chaque type de disfluence sur l'ensemble du texte lu</CardDescription>
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
                <span>N = Disfluences normales ({normalDisf})</span>
                <span>B = Télescopages ({telescopages})</span>
                <span>Bè = Disfluences bègues ({stuttDisf})</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={() => onComplete({
          articulationRate: avgRate,
          variability,
          samples,
          normalDisfluencies: normalDisf,
          telescopages,
          stutteringDisfluencies: stuttDisf,
          disfluencyDetails,
          audioBlob,
        })} className="w-full gap-2 shadow-lg" size="lg">
          Étape suivante — Écriture <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReadingStep;
