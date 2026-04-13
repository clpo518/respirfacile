/**
 * Step 2: OMAS — Oral Motor Assessment Scale (Riley & Riley, 1985)
 * 3 sous-épreuves : /pa/, /taka/, /pataka/
 * Consigne exacte : répéter la séquence 10 fois aussi vite que possible sans erreur
 * Mesure : vitesse articulatoire (SPS) + réussite/échec
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OMAS_NORMS } from "@/data/batteryNorms";
import BatteryRecorder from "../BatteryRecorder";
import { Info, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface OMASSubtest {
  syllable: string;
  success: boolean;
  speed: number;
  hasRecording: boolean;
}

export interface OMASData {
  pa: OMASSubtest;
  taka: OMASSubtest;
  pataka: OMASSubtest;
}

interface Props {
  onComplete: (data: OMASData) => void;
  initialData?: OMASData;
}

const defaultSubtest = (syllable: string): OMASSubtest => ({
  syllable, success: true, speed: 0, hasRecording: false
});

const OMASStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [pa, setPa] = useState<OMASSubtest>(initialData?.pa || defaultSubtest('/pa/'));
  const [taka, setTaka] = useState<OMASSubtest>(initialData?.taka || defaultSubtest('/taka/'));
  const [pataka, setPataka] = useState<OMASSubtest>(initialData?.pataka || defaultSubtest('/pataka/'));

  const norms = OMAS_NORMS.variables;

  const subtests = [
    { state: pa, set: setPa, label: '/pa/', norm: norms[0], syllables: 10,
      instruction: 'Répétez « pa » 10 fois de suite, aussi vite que possible, sans erreur.',
      example: 'pa-pa-pa-pa-pa-pa-pa-pa-pa-pa', step: 1 },
    { state: taka, set: setTaka, label: '/taka/', norm: norms[1], syllables: 20,
      instruction: 'Répétez « taka » 10 fois de suite, aussi vite que possible, sans erreur.',
      example: 'taka-taka-taka-taka-taka-taka-taka-taka-taka-taka', step: 2 },
    { state: pataka, set: setPataka, label: '/pataka/', norm: norms[2], syllables: 30,
      instruction: 'Répétez « pataka » 10 fois de suite, aussi vite que possible, sans erreur.',
      example: 'pataka-pataka-pataka-pataka-pataka-pataka-pataka-pataka-pataka-pataka', step: 3 },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Consigne patient */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Ce que vous allez faire :</p>
            <p className="text-muted-foreground mt-1">
              Répétez des syllabes <strong>le plus vite possible</strong>, 10 fois de suite, sans faire d'erreur.
              Si vous faites une erreur, on recommence. Votre orthophoniste vous montrera d'abord à quelle vitesse.
            </p>
          </div>
        </div>
      </div>

      {subtests.map(({ state, set, label, instruction, example, norm, step, syllables }) => (
        <Card key={label} className="overflow-hidden">
          {/* Zone patient : consigne + enregistrement */}
          <CardHeader className="pb-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">{step}</span>
                {label}
              </CardTitle>
              {state.hasRecording && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> Enregistré
                </Badge>
              )}
            </div>
            <CardDescription className="space-y-1 mt-1">
              <span className="text-xs">{instruction}</span>
              <span className="block text-[11px] font-mono text-muted-foreground/60 tracking-wider">{example}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <BatteryRecorder
              onRecordingComplete={(_blob, durationSeconds) => {
                const estimatedSPS = durationSeconds > 0 ? parseFloat((syllables / durationSeconds).toFixed(2)) : 0;
                set(prev => ({ ...prev, hasRecording: true, speed: prev.speed || estimatedSPS }));
              }}
              compact
            />

            {/* Zone clinicien : cotation (visible après enregistrement) */}
            {state.hasRecording && (
              <div className="border-t pt-3 space-y-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                  ✏️ Cotation orthophoniste
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={state.success}
                      onCheckedChange={(v) => set(prev => ({ ...prev, success: v }))}
                    />
                    <Label className={`text-sm flex items-center gap-1.5 ${state.success ? 'text-foreground' : 'text-destructive'}`}>
                      {state.success ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Réussi (10 sans erreur)</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Échoué</>
                      )}
                    </Label>
                  </div>
                  {state.success && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Vitesse (SPS)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24 text-center"
                        value={state.speed || ''}
                        onChange={e => set(prev => ({ ...prev, speed: parseFloat(e.target.value) || 0 }))}
                        placeholder={norm.mean.toFixed(2)}
                      />
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        norme : {norm.mean.toFixed(2)} ± {norm.sd.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={() => onComplete({ pa, taka, pataka })} className="w-full gap-2 shadow-lg" size="lg">
          Étape suivante — Encodage phonologique <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OMASStep;
