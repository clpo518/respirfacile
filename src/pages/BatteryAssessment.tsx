/**
 * Battery Assessment — Main wizard page
 * Therapist-only page for administering the Batterie d'Évaluation du Bredouillement
 * 
 * Steps: Patient → PCI Gate → Parole spontanée → OMAS → SPA → Reformulation → Lecture → Écriture → Résultats
 */
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Cloud, Loader2, AlertCircle, Clipboard, Mic, Activity, Eye, BookOpen, PenLine, BarChart3, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getRecordingExtension } from "@/lib/audioCompat";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PatientSelector, { SelectedPatient } from "@/components/battery/PatientSelector";
import PCIGateStep, { PCIGateData } from "@/components/battery/steps/PCIGateStep";
import PredictiveTestStep, { PredictiveTestData } from "@/components/battery/steps/PredictiveTestStep";
import OMASStep, { OMASData } from "@/components/battery/steps/OMASStep";
import SPAStep, { SPAData } from "@/components/battery/steps/SPAStep";
import RetellingStep, { RetellingData } from "@/components/battery/steps/RetellingStep";
import ReadingStep, { ReadingData } from "@/components/battery/steps/ReadingStep";
import WritingStep, { WritingData } from "@/components/battery/steps/WritingStep";
import BatteryResults from "@/components/battery/BatteryResults";
import BatteryStopwatch from "@/components/battery/BatteryStopwatch";
import StepObservations from "@/components/battery/StepObservations";
import BatteryHistory, { type AssessmentRecord } from "@/components/battery/BatteryHistory";

type Step = 'patient' | 'pci' | 'predictive' | 'omas' | 'spa' | 'retelling' | 'reading' | 'writing' | 'results';

type StepRole = 'ortho' | 'patient' | 'both';

const STEPS: { key: Step; label: string; shortLabel: string; icon: React.ReactNode; description: string; role: StepRole; roleHint?: string }[] = [
  { key: 'patient', label: 'Patient', shortLabel: 'Patient', icon: null, description: 'Sélection du patient', role: 'ortho' },
  { key: 'pci', label: 'Questionnaire PCI', shortLabel: 'PCI', icon: <Clipboard className="w-3.5 h-3.5" />, description: 'Inventaire prédictif du bredouillement', role: 'ortho', roleHint: 'Vous remplissez ce questionnaire en observant le patient' },
  { key: 'predictive', label: 'Parole spontanée', shortLabel: 'Parole', icon: <Mic className="w-3.5 h-3.5" />, description: 'Enregistrement + analyse VA et disfluences', role: 'patient', roleHint: 'Tournez l\'écran vers le patient — il parle, l\'outil enregistre et analyse' },
  { key: 'omas', label: 'Motricité orale', shortLabel: 'OMAS', icon: <Activity className="w-3.5 h-3.5" />, description: 'Diadococinésie — /pa/, /taka/, /pataka/', role: 'both', roleHint: 'Vous guidez, le patient exécute et l\'outil chronomètre' },
  { key: 'spa', label: 'Encodage phonologique', shortLabel: 'SPA', icon: <Eye className="w-3.5 h-3.5" />, description: 'Screening de la précision articulatoire', role: 'both', roleHint: 'Vous affichez les stimuli, le patient répète, vous cochez' },
  { key: 'retelling', label: 'Reformulation', shortLabel: 'Récit', icon: <BookOpen className="w-3.5 h-3.5" />, description: 'L\'histoire du porte-monnaie', role: 'patient', roleHint: 'Lisez l\'histoire puis laissez le patient reformuler — l\'outil enregistre' },
  { key: 'reading', label: 'Lecture', shortLabel: 'Lecture', icon: <BookOpen className="w-3.5 h-3.5" />, description: 'Lecture à voix haute — Maupassant', role: 'patient', roleHint: 'Le patient lit à voix haute, l\'outil enregistre et pré-remplit la cotation' },
  { key: 'writing', label: 'Écriture', shortLabel: 'Écriture', icon: <PenLine className="w-3.5 h-3.5" />, description: 'Copie et écriture spontanée', role: 'both', roleHint: 'Le patient écrit sur papier, vous comptez les erreurs ensuite' },
  { key: 'results', label: 'Résultats', shortLabel: 'Résultats', icon: <BarChart3 className="w-3.5 h-3.5" />, description: 'Synthèse et rapport PDF', role: 'ortho', roleHint: 'Tout est pré-rempli — vérifiez, ajustez et générez le PDF' },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const BatteryAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('patient');
  const [patient, setPatient] = useState<SelectedPatient | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [therapistName, setTherapistName] = useState<string | undefined>();

  // Step data
  const [pciData, setPciData] = useState<PCIGateData | undefined>();
  const [predictiveData, setPredictiveData] = useState<PredictiveTestData | undefined>();
  const [omasData, setOmasData] = useState<OMASData | undefined>();
  const [spaData, setSpaData] = useState<SPAData | undefined>();
  const [retellingData, setRetellingData] = useState<RetellingData | undefined>();
  const [readingData, setReadingData] = useState<ReadingData | undefined>();
  const [writingData, setWritingData] = useState<WritingData | undefined>();

  // Audio URLs for results playback
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  // Per-step observations
  const [observations, setObservations] = useState<Record<string, string>>({
    pci: '', predictive: '', omas: '', spa: '', retelling: '', reading: '', writing: '',
  });

  // View past assessment results
  const [viewingPastResults, setViewingPastResults] = useState<any>(null);

  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);
  const progressPercent = currentStep === 'patient' ? 0 : Math.round((currentStepIndex / (STEPS.length - 1)) * 100);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    if (!assessmentId) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [assessmentId]);

  // Create assessment in DB
  const createAssessment = useCallback(async (selectedPatient: SelectedPatient) => {
    if (!user) return;
    const { data, error } = await supabase.from('assessments').insert({
      therapist_id: user.id,
      patient_id: selectedPatient.mode === 'existing' ? selectedPatient.patientId : null,
      guest_name: selectedPatient.mode === 'guest' ? selectedPatient.patientName : null,
      guest_birth_year: selectedPatient.mode === 'guest' ? selectedPatient.birthYear : null,
      guest_gender: selectedPatient.mode === 'guest' ? selectedPatient.gender : null,
      status: 'in_progress',
    } as any).select('id').single();

    if (error) {
      toast.error("Erreur lors de la création du bilan");
      console.error(error);
      return;
    }
    setAssessmentId(data.id);
  }, [user]);

  // Upload audio blob to storage and return public URL
  const uploadStepAudio = useCallback(async (stepKey: string, blob: Blob, aId: string) => {
    try {
      const ext = getRecordingExtension(blob.type || 'audio/webm');
      const path = `battery/${aId}/${stepKey}.${ext}`;
      const { error } = await supabase.storage.from('recordings').upload(path, blob, {
        contentType: blob.type || 'audio/webm',
        upsert: true,
      });
      if (error) {
        console.error('Audio upload error:', error);
        return;
      }
      const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(path);
      if (urlData?.publicUrl) {
        setAudioUrls(prev => ({ ...prev, [stepKey]: urlData.publicUrl }));
      }
    } catch (err) {
      console.error('Audio upload failed:', err);
    }
  }, []);

  // Partial save after each step
  const savePartial = useCallback(async (overrides?: Record<string, any>) => {
    if (!assessmentId) return;
    setSaveStatus('saving');
    const results = {
      pci: overrides?.pciData ?? pciData ?? null,
      predictiveTest: overrides?.pData ?? predictiveData ? {
        pciScores: (overrides?.pData ?? predictiveData)?.pciScores,
        pciTotal: (overrides?.pData ?? predictiveData)?.pciTotal,
        spontaneousSpeech: (overrides?.pData ?? predictiveData)?.spontaneousSpeech,
      } : null,
      omas: overrides?.oData ?? omasData ? {
        pa: (overrides?.oData ?? omasData)?.pa,
        taka: (overrides?.oData ?? omasData)?.taka,
        pataka: (overrides?.oData ?? omasData)?.pataka,
      } : null,
      spa: overrides?.sData ?? spaData ? {
        items: (overrides?.sData ?? spaData)?.items,
        totals: (overrides?.sData ?? spaData)?.totals,
      } : null,
      retelling: overrides?.rData ?? retellingData ?? null,
      reading: overrides?.rdData ?? readingData ?? null,
      writing: overrides?.wData ?? writingData ?? null,
      observations: overrides?.obs ?? observations,
    };

    const { error } = await supabase.from('assessments').update({
      results,
      status: 'in_progress',
    } as any).eq('id', assessmentId);

    setSaveStatus(error ? 'error' : 'saved');
    if (error) console.error(error);
  }, [assessmentId, pciData, predictiveData, omasData, spaData, retellingData, readingData, writingData, observations]);

  // Step handlers
  const handlePatientSelect = async (p: SelectedPatient) => {
    setPatient(p);
    await createAssessment(p);
    setCurrentStep('pci');
  };

  // Resume an in-progress assessment
  const handleResume = (assessment: AssessmentRecord) => {
    const r = assessment.results || {};
    setAssessmentId(assessment.id);
    setPatient({
      mode: assessment.patient_id ? 'existing' : 'guest',
      patientId: assessment.patient_id || undefined,
      patientName: assessment.guest_name || 'Patient',
    } as SelectedPatient);

    if (r.pci) setPciData(r.pci);
    if (r.predictiveTest) setPredictiveData(r.predictiveTest);
    if (r.omas) setOmasData(r.omas);
    if (r.spa) setSpaData(r.spa);
    if (r.retelling) setRetellingData(r.retelling);
    if (r.reading) setReadingData(r.reading);
    if (r.writing) setWritingData(r.writing);
    if (r.observations) setObservations(prev => ({ ...prev, ...r.observations }));

    const stepOrder: Step[] = ['pci', 'predictive', 'omas', 'spa', 'retelling', 'reading', 'writing', 'results'];
    const dataKeys: Record<string, any> = {
      pci: r.pci, predictive: r.predictiveTest, omas: r.omas,
      spa: r.spa, retelling: r.retelling, reading: r.reading, writing: r.writing,
    };
    let resumeStep: Step = 'pci';
    for (const step of stepOrder) {
      if (dataKeys[step]) {
        const nextIdx = stepOrder.indexOf(step) + 1;
        if (nextIdx < stepOrder.length) resumeStep = stepOrder[nextIdx];
      } else {
        resumeStep = step;
        break;
      }
    }
    setCurrentStep(resumeStep);
    setSaveStatus('saved');
    toast.success("Bilan repris — continuez où vous en étiez");
  };

  const handlePCI = (data: PCIGateData) => {
    setPciData(data);
    if (!data.shouldContinue) {
      setCurrentStep('results');
      savePartial({ pciData: data });
      // Increment battery_count for PCI-only mini-rapport
      if (user?.id) {
        supabase.rpc('increment_battery_count' as any, { therapist_uuid: user.id });
      }
    } else {
      setCurrentStep('predictive');
      savePartial({ pciData: data });
    }
  };

  const handlePredictive = (data: PredictiveTestData) => {
    setPredictiveData(data);
    setCurrentStep('omas');
    savePartial({ pData: data });
    // Upload audio in background
    if (data.audioBlob && assessmentId) {
      uploadStepAudio('spontaneous', data.audioBlob, assessmentId);
    }
  };

  const handleOMAS = (data: OMASData) => {
    setOmasData(data);
    setCurrentStep('spa');
    savePartial({ oData: data });
  };

  const handleSPA = (data: SPAData) => {
    setSpaData(data);
    setCurrentStep('retelling');
    savePartial({ sData: data });
  };

  const handleRetelling = (data: RetellingData) => {
    setRetellingData(data);
    setCurrentStep('reading');
    savePartial({ rData: data });
    if (data.audioBlob && assessmentId) {
      uploadStepAudio('retelling', data.audioBlob, assessmentId);
    }
  };

  const handleReading = (data: ReadingData) => {
    setReadingData(data);
    setCurrentStep('writing');
    savePartial({ rdData: data });
    if (data.audioBlob && assessmentId) {
      uploadStepAudio('reading', data.audioBlob, assessmentId);
    }
  };

  const handleWriting = async (data: WritingData) => {
    setWritingData(data);
    setCurrentStep('results');
    setTimeout(async () => {
      if (!assessmentId) return;
      setSaveStatus('saving');
      const results = {
        pci: pciData ?? null,
        predictiveTest: predictiveData ? {
          pciScores: predictiveData.pciScores,
          pciTotal: predictiveData.pciTotal,
          spontaneousSpeech: predictiveData.spontaneousSpeech,
        } : null,
        omas: omasData ? { pa: omasData.pa, taka: omasData.taka, pataka: omasData.pataka } : null,
        spa: spaData ? { items: spaData.items, totals: spaData.totals } : null,
        retelling: retellingData || null,
        reading: readingData || null,
        writing: data,
        observations,
      };
      const { error } = await supabase.from('assessments').update({
        results, status: 'completed', completed_at: new Date().toISOString(),
      } as any).eq('id', assessmentId);
      if (error) {
        toast.error("Erreur lors de la sauvegarde");
        setSaveStatus('error');
      } else {
        toast.success("Bilan sauvegardé !");
        setSaveStatus('saved');
        // Increment battery_count for the therapist
        if (user?.id) {
          supabase.rpc('increment_battery_count' as any, { therapist_uuid: user.id });
        }
      }
    }, 300);
  };

  // Navigation
  const handleBack = () => {
    if (currentStep === 'patient') {
      navigate(-1);
    } else {
      const prevIdx = Math.max(0, currentStepIndex - 1);
      setCurrentStep(STEPS[prevIdx].key);
    }
  };

  const handleExit = () => {
    if (assessmentId) {
      setShowExitDialog(true);
    } else {
      navigate(-1);
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate(-1);
  };

  const updateObservation = (step: string, value: string) => {
    setObservations(prev => ({ ...prev, [step]: value }));
  };

  // Check therapist status
  const [isTherapist, setIsTherapist] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('is_therapist, full_name').eq('id', user.id).single()
      .then(({ data }) => {
        setIsTherapist(data?.is_therapist ?? false);
        setTherapistName(data?.full_name ?? undefined);
      });
  }, [user]);

  if (isTherapist === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Accès réservé</h2>
          <p className="text-muted-foreground">Ce bilan est accessible uniquement aux orthophonistes.</p>
          <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
        </div>
      </div>
    );
  }

  const patientAge = patient?.birthYear ? new Date().getFullYear() - patient.birthYear : undefined;
  const currentStepInfo = STEPS[currentStepIndex];

  // Render step with observations wrapper
  const renderStepWithObs = (stepKey: string, stepLabel: string, stepContent: React.ReactNode) => (
    <div>
      {stepContent}
      <div className="max-w-2xl mx-auto">
        <StepObservations
          value={observations[stepKey] || ''}
          onChange={(v) => updateObservation(stepKey, v)}
          stepLabel={stepLabel}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Étape précédente</TooltipContent>
              </Tooltip>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm truncate">Bilan Bredouillement</h1>
                  {assessmentId && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="inline-flex items-center">
                          {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                          {saveStatus === 'saved' && <Cloud className="w-3.5 h-3.5 text-primary" />}
                          {saveStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {saveStatus === 'saving' ? 'Sauvegarde en cours…' : saveStatus === 'saved' ? 'Sauvegardé automatiquement' : 'Erreur de sauvegarde'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {patient && (
                  <p className="text-xs text-muted-foreground truncate">{patient.patientName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <BatteryStopwatch />
              {assessmentId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleExit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sauvegarder et quitter</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Progress bar + step pills */}
          {currentStep !== 'patient' && (
            <div className="mt-3 space-y-2">
              {/* Linear progress */}
              <Progress value={progressPercent} className="h-1.5" />
              
              {/* Step pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {STEPS.filter(s => s.key !== 'patient').map((s, i) => {
                  const stepIdx = STEPS.findIndex(x => x.key === s.key);
                  const isCurrent = s.key === currentStep;
                  const isDone = stepIdx < currentStepIndex;
                  const isFuture = stepIdx > currentStepIndex;
                  const isClickable = stepIdx <= currentStepIndex;

                  return (
                    <Tooltip key={s.key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => { if (isClickable) setCurrentStep(s.key); }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all
                            ${isCurrent ? 'bg-primary text-primary-foreground shadow-sm' : ''}
                            ${isDone ? 'bg-primary/10 text-primary' : ''}
                            ${isFuture ? 'bg-muted text-muted-foreground/60' : ''}
                            ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                          `}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3" /> : s.icon}
                          <span className="hidden sm:inline">{s.shortLabel}</span>
                          <span className="sm:hidden">{i + 1}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                        {isDone && <p className="text-xs text-primary mt-1">✓ Complétée — cliquez pour revoir</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step context banner with role indicator */}
      {currentStep !== 'patient' && currentStepInfo && (
        <div className="bg-background border-b">
          <div className="max-w-3xl mx-auto px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                {currentStepInfo.icon || <BarChart3 className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{currentStepInfo.label}</h2>
                  {/* Role badge */}
                  {currentStepInfo.role === 'ortho' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-medium">
                      🧑‍⚕️ Orthophoniste
                    </span>
                  )}
                  {currentStepInfo.role === 'patient' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium">
                      🗣 Patient
                    </span>
                  )}
                  {currentStepInfo.role === 'both' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-medium">
                      🤝 Guidé
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{currentStepInfo.description}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {currentStepIndex} / {STEPS.length - 1}
              </div>
            </div>
            {/* Role hint */}
            {currentStepInfo.roleHint && (
              <p className="text-[11px] text-muted-foreground/80 italic pl-11">
                💡 {currentStepInfo.roleHint}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-8 pb-24">
        {currentStep === 'patient' && (
          <div className="space-y-6">
            <PatientSelector onSelect={handlePatientSelect} />
            {user && (
              <div className="max-w-2xl mx-auto">
                <BatteryHistory
                  therapistId={user.id}
                  onViewResults={(a) => setViewingPastResults(a)}
                  onResume={handleResume}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 'pci' && renderStepWithObs('pci', 'PCI',
          <PCIGateStep onComplete={handlePCI} initialData={pciData} />
        )}
        {currentStep === 'predictive' && renderStepWithObs('predictive', 'Parole spontanée',
          <PredictiveTestStep
            onComplete={handlePredictive}
            initialData={predictiveData}
            pciScores={pciData?.pciScores}
            pciTotal={pciData?.pciTotal}
          />
        )}
        {currentStep === 'omas' && renderStepWithObs('omas', 'OMAS',
          <OMASStep onComplete={handleOMAS} initialData={omasData} />
        )}
        {currentStep === 'spa' && renderStepWithObs('spa', 'SPA',
          <SPAStep onComplete={handleSPA} initialData={spaData} />
        )}
        {currentStep === 'retelling' && renderStepWithObs('retelling', 'Reformulation',
          <RetellingStep onComplete={handleRetelling} initialData={retellingData} />
        )}
        {currentStep === 'reading' && renderStepWithObs('reading', 'Lecture',
          <ReadingStep onComplete={handleReading} initialData={readingData} />
        )}
        {currentStep === 'writing' && renderStepWithObs('writing', 'Écriture',
          <WritingStep onComplete={handleWriting} initialData={writingData} />
        )}
        {currentStep === 'results' && (
          <BatteryResults
            patientName={patient?.patientName || 'Patient'}
            patientAge={patientAge}
            therapistName={therapistName}
            pciData={pciData}
            predictiveTest={predictiveData}
            omas={omasData}
            spa={spaData}
            retelling={retellingData}
            reading={readingData}
            writing={writingData}
            observations={observations}
            audioUrls={audioUrls}
            date={new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
        )}

        {/* Past results viewer */}
        {viewingPastResults && (
          <AlertDialog open={!!viewingPastResults} onOpenChange={() => setViewingPastResults(null)}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bilan du {new Date(viewingPastResults.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <BatteryResults
                patientName={patient?.patientName || 'Patient'}
                patientAge={patientAge}
                predictiveTest={viewingPastResults.results?.predictiveTest}
                omas={viewingPastResults.results?.omas}
                spa={viewingPastResults.results?.spa}
                retelling={viewingPastResults.results?.retelling}
                reading={viewingPastResults.results?.reading}
                writing={viewingPastResults.results?.writing}
                observations={viewingPastResults.results?.observations}
                date={new Date(viewingPastResults.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Fermer</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Exit dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le bilan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre progression a été sauvegardée automatiquement. Vous pourrez reprendre ce bilan depuis l'écran de sélection patient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer le bilan</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>Sauvegarder et quitter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BatteryAssessment;
