/**
 * Battery Results — Restitution conforme à la grille officielle
 * Compare toutes les mesures aux normes d'étalonnage (N=61, Van Zaalen et al. 2018)
 * 
 * EDITABLE: L'orthophoniste peut ajuster toutes les valeurs avant de générer le PDF.
 * Les données sont pré-remplies à partir des mesures collectées pendant le bilan.
 */
import React, { useState, useCallback } from "react";
import AudioPlayerWaveform from "./AudioPlayerWaveform";
import { pdf } from "@react-pdf/renderer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, AlertTriangle, CheckCircle, Minus, FileText, Loader2, PenLine, Cloud, Lock, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import BatteryReportPDF from "./BatteryReportPDF";
import { generateBatteryDOCX } from "./BatteryReportDOCX";
import {
  SPONTANEOUS_SPEECH_NORMS,
  OMAS_NORMS,
  SPA_NORMS,
  RETELLING_NORMS,
  READING_NORMS,
  COPY_NORMS_SLOW,
  COPY_NORMS_FAST,
  WRITING_NORMS_FREE,
  WRITING_NORMS_TIMED,
  PCI_THRESHOLD,
  INTERPRETATION_RULES,
  DISFLUENCY_TYPES,
  compareToNorm,
  type NormValue,
  type TaskNorms,
} from "@/data/batteryNorms";
import type { PredictiveTestData } from "./steps/PredictiveTestStep";
import type { OMASData } from "./steps/OMASStep";
import type { SPAData } from "./steps/SPAStep";
import type { RetellingData } from "./steps/RetellingStep";
import type { ReadingData } from "./steps/ReadingStep";
import type { WritingData } from "./steps/WritingStep";

interface Props {
  patientName: string;
  patientAge?: number;
  therapistName?: string;
  pciData?: { pciScores: number[]; pciTotal: number; shouldContinue: boolean };
  predictiveTest?: PredictiveTestData;
  omas?: OMASData;
  spa?: SPAData;
  retelling?: RetellingData;
  reading?: ReadingData;
  writing?: WritingData;
  observations?: Record<string, string>;
  audioUrls?: Record<string, string>;
  date: string;
}

const statusConfig = {
  normal: { icon: CheckCircle, label: "Normal", color: "text-green-600", bg: "bg-green-50" },
  borderline: { icon: Minus, label: "Limite", color: "text-yellow-600", bg: "bg-yellow-50" },
  atypical: { icon: AlertTriangle, label: "Atypique", color: "text-destructive", bg: "bg-destructive/10" },
};

const EditableNormRow: React.FC<{
  norm: NormValue;
  observed: number | null;
  onChange: (val: number | null) => void;
  needsManualInput?: boolean;
}> = ({ norm, observed, onChange, needsManualInput }) => {
  const status = observed !== null && observed !== undefined ? compareToNorm(observed, norm) : null;
  const cfg = status ? statusConfig[status] : null;
  const StatusIcon = cfg?.icon;
  const isZeroManual = needsManualInput && observed === 0;

  return (
    <tr className={`border-b border-border/50 ${cfg?.bg || ''} ${needsManualInput ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
      <td className="py-2 px-3 text-sm">
        {norm.label} {norm.unit && <span className="text-muted-foreground text-xs">({norm.unit})</span>}
        {needsManualInput && (
          <span className="ml-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">🤖 auto-détecté · à vérifier</span>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-center">
        <Input
          type="number"
          step="0.01"
          value={observed ?? ''}
          onChange={e => {
            const v = e.target.value;
            onChange(v === '' ? null : parseFloat(v));
          }}
          className={`w-20 h-7 text-center text-sm font-bold mx-auto ${isZeroManual ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : ''}`}
          placeholder="—"
        />
      </td>
      <td className="py-2 px-3 text-sm text-center">{norm.mean}</td>
      <td className="py-2 px-3 text-sm text-center">{norm.sd}</td>
      <td className="py-2 px-3 text-sm text-center">{norm.upperBound2SD ?? '—'}</td>
      <td className="py-2 px-3 text-sm text-center">{norm.lowerBound2SD ?? '—'}</td>
      <td className="py-2 px-3 text-sm text-center">
        {cfg && StatusIcon ? (
          <span className={`inline-flex items-center gap-1 ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{cfg.label}</span>
          </span>
        ) : '—'}
      </td>
    </tr>
  );
};

const EditableNormTable: React.FC<{
  task: TaskNorms;
  values: (number | null)[];
  onUpdate: (index: number, value: number | null) => void;
  manualIndices?: number[];
}> = ({ task, values, onUpdate, manualIndices = [] }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        {task.taskName}
        <PenLine className="w-3 h-3 text-muted-foreground" />
      </CardTitle>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Variable</th>
            <th className="py-2 px-3 text-xs font-medium text-center">Observé</th>
            <th className="py-2 px-3 text-xs font-medium text-center">Moyenne</th>
            <th className="py-2 px-3 text-xs font-medium text-center">ET</th>
            <th className="py-2 px-3 text-xs font-medium text-center">Borne sup.</th>
            <th className="py-2 px-3 text-xs font-medium text-center">Borne inf.</th>
            <th className="py-2 px-3 text-xs font-medium text-center">Statut</th>
          </tr>
        </thead>
        <tbody>
          {task.variables.map((norm, i) => (
            <EditableNormRow
              key={i}
              norm={norm}
              observed={values[i] ?? null}
              onChange={val => onUpdate(i, val)}
              needsManualInput={manualIndices.includes(i)}
            />
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
);

const DisfluencyTable: React.FC<{ title: string; details: Record<string, number> }> = ({ title, details }) => {
  const normalCount = DISFLUENCY_TYPES
    .filter(d => d.category === 'normal')
    .reduce((sum, d) => sum + (details[d.key] || 0), 0);
  const telescopages = details['telescopage'] || 0;
  const stuttCount = DISFLUENCY_TYPES
    .filter(d => d.category === 'stuttering')
    .reduce((sum, d) => sum + (details[d.key] || 0), 0);
  const total = normalCount + telescopages + stuttCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title} — Détail des disfluences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {DISFLUENCY_TYPES.map(d => (
            <div key={d.key} className="flex justify-between">
              <span className="text-muted-foreground">{d.label}</span>
              <span className={`font-mono ${(details[d.key] || 0) > 0 ? 'font-bold' : ''}`}>
                {details[d.key] || 0}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 pt-2 border-t text-xs">
          <span>Normales : <strong>{normalCount}</strong></span>
          <span>Télescopages : <strong className={telescopages > 0 ? 'text-orange-600' : ''}>{telescopages}</strong></span>
          <span>Bègues : <strong className={stuttCount > 0 ? 'text-destructive' : ''}>{stuttCount}</strong></span>
          <span>Total : <strong>{total}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
};

const SamplesRow: React.FC<{ title: string; samples: number[]; avgRate: number; variability: number }> = ({
  title, samples, avgRate, variability,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">{title} — 5 échantillons VA</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex gap-3 items-center text-sm">
        {samples.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-xs text-muted-foreground">Éch.{i + 1}</div>
            <div className="font-mono">{s > 0 ? s.toFixed(2) : '—'}</div>
          </div>
        ))}
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">Moyenne</div>
          <div className="font-bold">{avgRate > 0 ? avgRate.toFixed(2) : '—'} SPS</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Variabilité</div>
          <div className={`font-bold ${variability > 3 ? 'text-destructive' : ''}`}>
            {variability > 0 ? variability.toFixed(2) : '—'} SPS
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BatteryResults: React.FC<Props> = ({
  patientName, patientAge, therapistName, pciData, predictiveTest, omas, spa, retelling, reading, writing, observations, audioUrls, date,
}) => {
  const isPciOnly = pciData && !pciData.shouldContinue && !predictiveTest;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);

  // Editable state for all norm values — pre-filled from auto-detection + manual input
  const [spontaneousValues, setSpontaneousValues] = useState<(number | null)[]>(
    predictiveTest ? [
      predictiveTest.spontaneousSpeech.articulationRate || null,
      predictiveTest.spontaneousSpeech.variability || null,
      predictiveTest.spontaneousSpeech.normalDisfluencies,
      predictiveTest.spontaneousSpeech.telescopages,
      predictiveTest.spontaneousSpeech.stutteringDisfluencies,
      predictiveTest.spontaneousSpeech.syntaxErrors,
    ] : []
  );

  const [omasValues, setOmasValues] = useState<(number | null)[]>(
    omas ? [
      omas.pa.success ? omas.pa.speed || null : null,
      omas.taka.success ? omas.taka.speed || null : null,
      omas.pataka.success ? omas.pataka.speed || null : null,
    ] : []
  );

  const [spaValues, setSpaValues] = useState<(number | null)[]>(
    spa ? [
      spa.totals.precision ?? null,
      spa.totals.voisement ?? null,
      spa.totals.flux ?? null,
      spa.totals.sequentialisation ?? null,
      spa.totals.debit ?? null,
    ] : []
  );

  const [retellingValues, setRetellingValues] = useState<(number | null)[]>(
    retelling ? [
      retelling.articulationRate || null,
      retelling.variability || null,
      retelling.normalDisfluencies,
      retelling.telescopages,
      retelling.stutteringDisfluencies,
      retelling.syntaxErrors,
      retelling.mainCount,
      retelling.secondaryCount,
      retelling.additions,
    ] : []
  );

  const [readingValues, setReadingValues] = useState<(number | null)[]>(
    reading ? [
      reading.articulationRate || null,
      reading.variability || null,
      reading.normalDisfluencies,
      reading.telescopages,
      reading.stutteringDisfluencies,
    ] : []
  );

  const [copySlowValues, setCopySlowValues] = useState<(number | null)[]>(
    writing ? [writing.copySlowErrors, writing.copySlowTelescopages] : []
  );
  const [copyFastValues, setCopyFastValues] = useState<(number | null)[]>(
    writing ? [writing.copyFastErrors, writing.copyFastTelescopages] : []
  );
  const [writeFreeValues, setWriteFreeValues] = useState<(number | null)[]>(
    writing ? [writing.writingFreeErrors, writing.writingFreeTelescopages, writing.writingFreeSyntaxErrors] : []
  );
  const [writeTimedValues, setWriteTimedValues] = useState<(number | null)[]>(
    writing ? [writing.writingTimedErrors, writing.writingTimedTelescopages, writing.writingTimedSyntaxErrors] : []
  );

  const updateArray = useCallback((setter: React.Dispatch<React.SetStateAction<(number | null)[]>>) => {
    return (index: number, value: number | null) => {
      setter(prev => {
        const copy = [...prev];
        copy[index] = value;
        return copy;
      });
    };
  }, []);

  // Build PDF data from editable state
  const buildEditedPredictiveTest = (): PredictiveTestData | undefined => {
    if (!predictiveTest) return undefined;
    return {
      ...predictiveTest,
      spontaneousSpeech: {
        ...predictiveTest.spontaneousSpeech,
        articulationRate: spontaneousValues[0] ?? 0,
        variability: spontaneousValues[1] ?? 0,
        normalDisfluencies: spontaneousValues[2] ?? 0,
        telescopages: spontaneousValues[3] ?? 0,
        stutteringDisfluencies: spontaneousValues[4] ?? 0,
        syntaxErrors: spontaneousValues[5] ?? 0,
      },
    };
  };

  const buildEditedOmas = (): OMASData | undefined => {
    if (!omas) return undefined;
    return {
      pa: { ...omas.pa, speed: omasValues[0] ?? 0 },
      taka: { ...omas.taka, speed: omasValues[1] ?? 0 },
      pataka: { ...omas.pataka, speed: omasValues[2] ?? 0 },
    };
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const doc = (
        <BatteryReportPDF
          patientName={patientName}
          patientAge={patientAge}
          therapistName={therapistName}
          predictiveTest={buildEditedPredictiveTest()}
          omas={buildEditedOmas()}
          spa={spa}
          retelling={retelling}
          reading={reading}
          writing={writing}
          observations={observations}
          date={date}
        />
      );
      const blob = await pdf(doc).toBlob();
      const patientSlug = (patientName || "patient")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const dateSlug = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bilan-bredouillement-${patientSlug}-${dateSlug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF généré avec succès !");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setPdfLoading(false);
    }
  };
  const handleDownloadDOCX = async () => {
    setDocxLoading(true);
    try {
      await generateBatteryDOCX({
        patientName,
        patientAge,
        therapistName,
        predictiveTest: buildEditedPredictiveTest(),
        omas: buildEditedOmas(),
        spa,
        retelling,
        reading,
        writing,
        observations,
        date,
      });
      toast.success("Document Word généré !");
    } catch (err) {
      console.error("DOCX generation error:", err);
      toast.error("Erreur lors de la génération du document Word");
    } finally {
      setDocxLoading(false);
    }
  };

  const speeds = [
    spontaneousValues[0],
    retellingValues[0],
    readingValues[0],
  ].filter((v): v is number => !!v && v > 0);

  const speedLabels = ['Parole spontanée', 'Reformulation', 'Lecture'];
  const speedEntries = [spontaneousValues[0], retellingValues[0], readingValues[0]];

  let speedInterpretation: string | null = null;
  if (speeds.length >= 2) {
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    const diff = maxSpeed - minSpeed;
    if (diff <= INTERPRETATION_RULES.speedDifferenceThreshold) {
      speedInterpretation = `Différence de VA entre modes = ${diff.toFixed(2)} SPS (≤ ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Non-ajustement de la vitesse en fonction de la complexité = indication pour le bredouillement`;
    } else {
      speedInterpretation = `Différence de VA entre modes = ${diff.toFixed(2)} SPS (> ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Ajustement normal de la vitesse`;
    }
  }

  // Variability interpretation
  const variabilities = [
    { label: 'Parole spontanée', value: spontaneousValues[1] },
    { label: 'Reformulation', value: retellingValues[1] },
    { label: 'Lecture', value: readingValues[1] },
  ].filter(v => !!v.value && v.value > 0);

  const highVariabilityModes = variabilities.filter(v => v.value! > INTERPRETATION_RULES.variabilityThreshold);

  // PCI-only mini-report (early stop)
  if (isPciOnly && pciData) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2 pb-4 border-b">
          <h2 className="text-2xl font-bold">Mini-rapport PCI</h2>
          <p className="text-lg">{patientName} {patientAge ? `(${patientAge} ans)` : ''}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Inventaire Prédictif du Bredouillement (PCI)
              <Badge variant="secondary" className="text-primary border-primary/20">
                {pciData.pciTotal}/50
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Score ≤ {PCI_THRESHOLD} : pas d'indication de bredouillement au test prédictif
            </div>
            <div className="text-sm text-muted-foreground">
              La batterie complète n'a pas été poursuivie suite au résultat du questionnaire prédictif.
            </div>
          </CardContent>
        </Card>

        {observations && Object.values(observations).some(v => v?.trim()) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Observations cliniques</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(observations)
                .filter(([, v]) => v?.trim())
                .map(([key, val]) => (
                  <p key={key} className="text-sm text-muted-foreground">{val}</p>
                ))}
            </CardContent>
          </Card>
        )}

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium">
            <Lock className="w-4 h-4" />
            Conclusion enregistrée
          </div>
          <p className="text-sm text-green-600 dark:text-green-400/80">
            Le score PCI ne suggère pas de bredouillement. Aucune évaluation complémentaire n'a été réalisée.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={handleDownloadPDF} disabled={pdfLoading} className="gap-2" size="lg">
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Télécharger PDF
          </Button>
          <Button onClick={handleDownloadDOCX} disabled={docxLoading} variant="outline" className="gap-2" size="lg">
            {docxLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Télécharger Word
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Ortho handoff banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">Le bilan est pré-rempli — à vous de jouer</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Toutes les mesures (VA, variabilité, disfluences détectées automatiquement, scores SPA…) ont été reportées.
              <strong> Vous pouvez modifier chaque valeur</strong> avant de générer le rapport.
            </p>
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Cloud className="w-3.5 h-3.5 text-primary" />
                Tout est sauvegardé automatiquement — vous pouvez revenir à tout moment.
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>
                  <strong className="text-foreground">Export PDF + Word</strong> — le PDF ne vous bloque pas ! Téléchargez en Word pour personnaliser, ajouter votre en-tête, et l'intégrer à votre compte-rendu.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b">
        <h2 className="text-2xl font-bold">Bilan Bredouillement</h2>
        <p className="text-lg">{patientName} {patientAge ? `(${patientAge} ans)` : ''}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
        <p className="text-xs text-muted-foreground">
          Batterie d'Évaluation du Bredouillement — Van Zaalen, Aumont Boucand, Brejon, Desportes, Meyer (2018) — N = 61
        </p>
      </div>

      {/* PCI */}
      {predictiveTest && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Test prédictif (PCI)
              <Badge variant={predictiveTest.pciTotal > PCI_THRESHOLD ? "destructive" : "secondary"}>
                {predictiveTest.pciTotal}/50
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictiveTest.pciTotal > PCI_THRESHOLD ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Score {'>'} 24 : indication d'un bredouillement possible — poursuite de l'évaluation recommandée
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Score ≤ 24 : pas d'indication de bredouillement au test prédictif
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parole spontanée */}
      {predictiveTest && (
        <>
          {audioUrls?.spontaneous && (
            <AudioPlayerWaveform audioUrl={audioUrls.spontaneous} label="🎙 Parole spontanée" />
          )}
          <EditableNormTable task={SPONTANEOUS_SPEECH_NORMS} values={spontaneousValues} onUpdate={updateArray(setSpontaneousValues)} manualIndices={[2, 3, 4, 5]} />
          {predictiveTest.spontaneousSpeech.samples && (
            <SamplesRow
              title="Parole spontanée"
              samples={predictiveTest.spontaneousSpeech.samples}
              avgRate={spontaneousValues[0] ?? 0}
              variability={spontaneousValues[1] ?? 0}
            />
          )}
          {predictiveTest.spontaneousSpeech.disfluencyDetails && (
            <DisfluencyTable title="Parole spontanée" details={predictiveTest.spontaneousSpeech.disfluencyDetails} />
          )}
        </>
      )}

      {/* OMAS */}
      {omas && (
        <>
          <EditableNormTable task={OMAS_NORMS} values={omasValues} onUpdate={updateArray(setOmasValues)} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OMAS — Réussite par sous-épreuve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm text-center">
                {[
                  { label: '/pa/', data: omas.pa },
                  { label: '/taka/', data: omas.taka },
                  { label: '/pataka/', data: omas.pataka },
                ].map(({ label, data }) => (
                  <div key={label}>
                    <div className="font-medium">{label}</div>
                    <Badge variant={data.success ? "secondary" : "destructive"} className="mt-1">
                      {data.success ? '✓ Réussi' : '✗ Échoué'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* SPA */}
      {spa && <EditableNormTable task={SPA_NORMS} values={spaValues} onUpdate={updateArray(setSpaValues)} />}

      {/* Reformulation */}
      {retelling && (
        <>
          {audioUrls?.retelling && (
            <AudioPlayerWaveform audioUrl={audioUrls.retelling} label="🎙 Reformulation" />
          )}
          <EditableNormTable task={RETELLING_NORMS} values={retellingValues} onUpdate={updateArray(setRetellingValues)} manualIndices={[2, 3, 4, 5]} />
          {retelling.samples && (
            <SamplesRow
              title="Reformulation"
              samples={retelling.samples}
              avgRate={retellingValues[0] ?? 0}
              variability={retellingValues[1] ?? 0}
            />
          )}
          {retelling.disfluencyDetails && (
            <DisfluencyTable title="Reformulation" details={retelling.disfluencyDetails} />
          )}
        </>
      )}

      {/* Lecture */}
      {reading && (
        <>
          {audioUrls?.reading && (
            <AudioPlayerWaveform audioUrl={audioUrls.reading} label="🎙 Lecture" />
          )}
          <EditableNormTable task={READING_NORMS} values={readingValues} onUpdate={updateArray(setReadingValues)} manualIndices={[2, 3, 4]} />
          {reading.samples && (
            <SamplesRow
              title="Lecture"
              samples={reading.samples}
              avgRate={readingValues[0] ?? 0}
              variability={readingValues[1] ?? 0}
            />
          )}
          {reading.disfluencyDetails && (
            <DisfluencyTable title="Lecture" details={reading.disfluencyDetails} />
          )}
        </>
      )}

      {/* Écriture */}
      {writing && (
        <>
          <EditableNormTable task={COPY_NORMS_SLOW} values={copySlowValues} onUpdate={updateArray(setCopySlowValues)} />
          <EditableNormTable task={COPY_NORMS_FAST} values={copyFastValues} onUpdate={updateArray(setCopyFastValues)} />
          <EditableNormTable task={WRITING_NORMS_FREE} values={writeFreeValues} onUpdate={updateArray(setWriteFreeValues)} />
          <EditableNormTable task={WRITING_NORMS_TIMED} values={writeTimedValues} onUpdate={updateArray(setWriteTimedValues)} />

          {/* Extra writing fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Observations écriture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Vitesse copie lente</span>
                  <div className="font-bold">{writing.copySlowSpeed ? `${writing.copySlowSpeed} car/s` : '—'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Vitesse copie rapide</span>
                  <div className="font-bold">{writing.copyFastSpeed ? `${writing.copyFastSpeed} car/s` : '—'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Taille du graphisme</span>
                  <div className="font-bold capitalize">
                    {writing.graphismSize === 'small' ? 'Petit (micrographie)' :
                     writing.graphismSize === 'large' ? 'Grand (macrographie)' : 'Normal'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Cross-mode VA comparison */}
      {speeds.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comparaison inter-modes — Vitesse articulatoire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm text-center pb-3 border-b">
              {speedLabels.map((label, i) => (
                <div key={label}>
                  <div className="text-muted-foreground text-xs">{label}</div>
                  <div className="font-bold text-lg">
                    {speedEntries[i] && speedEntries[i]! > 0 ? speedEntries[i]!.toFixed(2) : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">SPS</div>
                </div>
              ))}
            </div>

            {speedInterpretation && (
              <div className={`p-3 rounded-lg text-sm ${
                speeds.length >= 2 && (Math.max(...speeds) - Math.min(...speeds)) <= INTERPRETATION_RULES.speedDifferenceThreshold
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-green-50 text-green-700'
              }`}>
                {speedInterpretation}
              </div>
            )}

            {highVariabilityModes.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                Variabilité {'>'} {INTERPRETATION_RULES.variabilityThreshold} SPS détectée en :
                {' '}{highVariabilityModes.map(m => m.label).join(', ')}
                {' '}→ indication pour le bredouillement
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Synthesis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Synthèse</CardTitle>
          <CardDescription>Résumé automatique basé sur les seuils d'étalonnage (N=61)</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {predictiveTest && (
            <div className="flex items-center gap-2">
              {predictiveTest.pciTotal > PCI_THRESHOLD ? (
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <span>PCI : {predictiveTest.pciTotal}/50 {predictiveTest.pciTotal > PCI_THRESHOLD ? '(suspect)' : '(normal)'}</span>
            </div>
          )}
          {speeds.length >= 2 && (
            <div className="flex items-center gap-2">
              {(Math.max(...speeds) - Math.min(...speeds)) <= INTERPRETATION_RULES.speedDifferenceThreshold ? (
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <span>Ajustement VA inter-modes : Δ = {(Math.max(...speeds) - Math.min(...speeds)).toFixed(2)} SPS</span>
            </div>
          )}
          {highVariabilityModes.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span>Variabilité excessive en {highVariabilityModes.map(m => m.label).join(', ')}</span>
            </div>
          )}
          {retelling && (
            <div className="flex items-center gap-2">
              {(retellingValues[6] ?? 0) < 5 ? (
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <span>Reformulation : {retellingValues[6] ?? 0}/13 items principaux, {retellingValues[7] ?? 0}/9 secondaires</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observations */}
      {observations && Object.values(observations).some(v => v.trim()) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Observations cliniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'predictive', label: 'Parole spontanée' },
              { key: 'omas', label: 'OMAS' },
              { key: 'spa', label: 'SPA' },
              { key: 'retelling', label: 'Reformulation' },
              { key: 'reading', label: 'Lecture' },
              { key: 'writing', label: 'Écriture' },
            ].filter(s => observations[s.key]?.trim()).map(s => (
              <div key={s.key}>
                <div className="text-xs font-medium text-muted-foreground mb-1">{s.label}</div>
                <p className="text-sm whitespace-pre-line">{observations[s.key]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Final message + Actions */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-green-600" />
          <p className="font-semibold text-green-700 dark:text-green-400 text-lg">Bilan terminé et sauvegardé</p>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400">
          Toutes les données sont sauvegardées. Vous pouvez ajuster les valeurs ci-dessus puis télécharger le rapport.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pb-8">
        <Button className="gap-2 w-full sm:w-auto" size="lg" onClick={handleDownloadPDF} disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {pdfLoading ? "Génération..." : "Télécharger PDF"}
        </Button>
        <Button variant="outline" className="gap-2 w-full sm:w-auto" size="lg" onClick={handleDownloadDOCX} disabled={docxLoading}>
          {docxLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          {docxLoading ? "Génération..." : "Télécharger Word"}
        </Button>
        <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => window.print()}>
          <Download className="w-4 h-4" /> Imprimer
        </Button>
      </div>
    </div>
  );
};

export default BatteryResults;
