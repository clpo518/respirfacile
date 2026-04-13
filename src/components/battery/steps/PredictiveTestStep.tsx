/**
 * Step: Parole spontanée (formerly part of PredictiveTestStep)
 * - Enregistrement 5 min de parole spontanée
 * - VA sur 5 échantillons de 10 syllabes
 * - Grille de 8 types de disfluences
 * - Erreurs syntaxiques
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SPONTANEOUS_SPEECH_NORMS, DISFLUENCY_TYPES } from "@/data/batteryNorms";
import BatteryRecorder from "../BatteryRecorder";
import { Info, ArrowRight } from "lucide-react";
import type { BatteryDisfluencyResult } from "@/lib/batteryDisfluencyDetection";

export interface PredictiveTestData {
  pciScores: number[];
  pciTotal: number;
  recording?: { blob: Blob; duration: number };
  audioBlob?: Blob;
  spontaneousSpeech: {
    articulationRate: number;
    variability: number;
    samples: number[];
    normalDisfluencies: number;
    telescopages: number;
    stutteringDisfluencies: number;
    syntaxErrors: number;
    disfluencyDetails: Record<string, number>;
  };
}

interface Props {
  onComplete: (data: PredictiveTestData) => void;
  initialData?: PredictiveTestData;
  pciScores?: number[];
  pciTotal?: number;
}

const PredictiveTestStep: React.FC<Props> = ({ onComplete, initialData, pciScores, pciTotal }) => {
  const [hasRecording, setHasRecording] = useState(!!initialData?.recording);
  const [recordingData, setRecordingData] = useState<{ blob: Blob; duration: number } | null>(initialData?.recording || null);
  const [samples, setSamples] = useState<number[]>(initialData?.spontaneousSpeech?.samples || [0, 0, 0, 0, 0]);
  const [syntaxErr, setSyntaxErr] = useState(initialData?.spontaneousSpeech?.syntaxErrors?.toString() || '');
  const [disfluencyDetails, setDisfluencyDetails] = useState<Record<string, number>>(
    initialData?.spontaneousSpeech?.disfluencyDetails ||
    Object.fromEntries(DISFLUENCY_TYPES.map(d => [d.key, 0]))
  );

  const handleRecording = (blob: Blob, duration: number) => {
    setRecordingData({ blob, duration });
    setHasRecording(true);
  };

  const handleDisfluenciesDetected = (result: BatteryDisfluencyResult) => {
    setDisfluencyDetails(prev => {
      const merged = { ...prev };
      for (const [key, val] of Object.entries(result.disfluencyDetails)) {
        if (val > 0) merged[key] = val;
      }
      return merged;
    });
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

  const norm = SPONTANEOUS_SPEECH_NORMS.variables[0];

  const handleSubmit = () => {
    onComplete({
      pciScores: pciScores || initialData?.pciScores || [],
      pciTotal: pciTotal ?? initialData?.pciTotal ?? 0,
      recording: recordingData || undefined,
      audioBlob: recordingData?.blob || undefined,
      spontaneousSpeech: {
        articulationRate: avgRate,
        variability,
        samples,
        normalDisfluencies: normalDisf,
        telescopages,
        stutteringDisfluencies: stuttDisf,
        syntaxErrors: parseInt(syntaxErr) || 0,
        disfluencyDetails,
      },
    });
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
            <p className="text-muted-foreground mt-1">
              Parlez librement pendant quelques minutes. Vous pouvez vous présenter, raconter un film vu récemment,
              ou parler de vos vacances. Il n'y a pas de bonne ou de mauvaise réponse.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Appuyez sur le bouton pour commencer l'enregistrement, puis parlez naturellement.
            </p>
          </div>
        </div>
      </div>

      {/* Recording */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enregistrement</CardTitle>
        </CardHeader>
        <CardContent>
          <BatteryRecorder
            onRecordingComplete={handleRecording}
            minDuration={30}
            maxDuration={300}
            label="Parole spontanée (5 min recommandées)"
            autoDetectDisfluencies
            onDisfluenciesDetected={handleDisfluenciesDetected}
          />
        </CardContent>
      </Card>

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
            Après l'enregistrement, réécouter et repérer 5 segments de 10 syllabes consécutives.
            Chronométrer chaque segment, puis saisir la VA = 10 / temps (en secondes).
            <br />
            <span className="text-xs">Norme : {norm.mean.toFixed(2)} ± {norm.sd.toFixed(2)} SPS</span>
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
          <CardTitle className="text-base">Disfluences observées (/200 syllabes)</CardTitle>
          <CardDescription>Comptez chaque type de disfluence sur le corpus de 200 syllabes</CardDescription>
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

      {/* Syntax errors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mesures complémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs">Erreurs syntaxiques</Label>
            <Input type="number" value={syntaxErr} onChange={e => setSyntaxErr(e.target.value)} placeholder="0" className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={handleSubmit} className="w-full gap-2 shadow-lg" size="lg">
          Étape suivante — Motricité orale <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PredictiveTestStep;
