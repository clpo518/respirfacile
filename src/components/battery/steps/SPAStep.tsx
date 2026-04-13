/**
 * Step 3: Encodage phonologique (SPA — Screening Phonological Accuracy)
 * Protocol exact (Van Zaalen):
 *   1. Le mot s'affiche 5 secondes (lecture silencieuse)
 *   2. Le mot disparaît
 *   3. L'enregistrement démarre automatiquement
 *   4. Le patient prononce le mot 3× de suite, aussi vite que possible, sans pause
 *   5. L'enregistrement s'arrête
 *   6. Le thérapeute cote les erreurs (en direct ou réécoute)
 *   7. Passage au mot suivant
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SPA_ITEMS, SPA_ERROR_TYPES } from "@/data/batteryNorms";
import { createCompatibleRecorder, createAudioBlob } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { Eye, EyeOff, Mic, Play, Pause, RotateCcw, ChevronRight, Square, ArrowRight } from "lucide-react";

export interface SPAItemResult {
  item: string;
  errors: Record<string, boolean>;
  audioUrl?: string;
}

export interface SPAData {
  items: SPAItemResult[];
  totals: Record<string, number>;
}

interface Props {
  onComplete: (data: SPAData) => void;
  initialData?: SPAData;
}

type ItemPhase = 'ready' | 'showing' | 'hidden' | 'recording' | 'paused' | 'scoring';

const DISPLAY_DURATION = 5; // seconds

const defaultItems = (): SPAItemResult[] =>
  SPA_ITEMS.map(item => ({
    item,
    errors: Object.fromEntries(SPA_ERROR_TYPES.map(t => [t.key, false]))
  }));

const SPAStep: React.FC<Props> = ({ onComplete, initialData }) => {
  const [items, setItems] = useState<SPAItemResult[]>(initialData?.items || defaultItems());
  const [currentItem, setCurrentItem] = useState(0);
  const [phase, setPhase] = useState<ItemPhase>('ready');
  const [countdown, setCountdown] = useState(DISPLAY_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef(0);
  const recIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recIntervalRef.current) clearInterval(recIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Start the sequence: show word for 5s, then hide + record
  const startSequence = useCallback(async () => {
    setPhase('showing');
    setCountdown(DISPLAY_DURATION);

    // Phase 1: countdown 5s
    let remaining = DISPLAY_DURATION;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Phase 2: hide word + start recording
        setPhase('hidden');
        startRecording();
      }
    }, 1000);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      streamRef.current = stream;
      const recorder = createCompatibleRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = createAudioBlob(chunksRef.current);
        const url = URL.createObjectURL(blob);
        setItems(prev => {
          const copy = [...prev];
          copy[currentItem] = { ...copy[currentItem], audioUrl: url };
          return copy;
        });
        stream.getTracks().forEach(t => t.stop());
        setPhase('scoring');
      };

      recorder.start(1000);
      startTimeRef.current = Date.now();
      setRecordDuration(0);
      setPhase('recording');

      recIntervalRef.current = setInterval(() => {
        setRecordDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      // Permission denied — fallback to manual scoring
      setPhase('scoring');
    }
  }, [currentItem]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
    }
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    setPhase('paused');
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
    }
    recIntervalRef.current = setInterval(() => {
      setRecordDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    setPhase('recording');
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
  }, []);

  const togglePlayback = useCallback(() => {
    const url = items[currentItem].audioUrl;
    if (!url) return;
    if (!audioRef.current || audioRef.current.src !== url) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [items, currentItem, isPlaying]);

  const toggleError = (itemIdx: number, errorKey: string) => {
    setItems(prev => {
      const copy = [...prev];
      copy[itemIdx] = {
        ...copy[itemIdx],
        errors: { ...copy[itemIdx].errors, [errorKey]: !copy[itemIdx].errors[errorKey] }
      };
      return copy;
    });
  };

  const goToNext = () => {
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    if (currentItem < SPA_ITEMS.length - 1) {
      setCurrentItem(currentItem + 1);
      setPhase('ready');
    }
  };

  const goToPrev = () => {
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    if (currentItem > 0) {
      setCurrentItem(currentItem - 1);
      // If already scored, go back to scoring view
      setPhase(items[currentItem - 1].audioUrl ? 'scoring' : 'ready');
    }
  };

  const redoItem = () => {
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    setItems(prev => {
      const copy = [...prev];
      if (copy[currentItem].audioUrl) {
        URL.revokeObjectURL(copy[currentItem].audioUrl!);
      }
      copy[currentItem] = { ...copy[currentItem], audioUrl: undefined };
      return copy;
    });
    setPhase('ready');
  };

  const totals = SPA_ERROR_TYPES.reduce((acc, t) => {
    acc[t.key] = items.filter(i => i.errors[t.key]).length;
    return acc;
  }, {} as Record<string, number>);

  const totalErrors = Object.values(totals).reduce((a, b) => a + b, 0);
  const scoredCount = items.filter(i => i.audioUrl).length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Item navigation pills */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {SPA_ITEMS.map((_, i) => {
          const hasErrors = Object.values(items[i].errors).some(Boolean);
          const isDone = !!items[i].audioUrl;
          return (
            <button
              key={i}
              onClick={() => {
                if (phase === 'recording' || phase === 'paused' || phase === 'showing' || phase === 'hidden') return;
                if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
                setCurrentItem(i);
                setPhase(isDone ? 'scoring' : 'ready');
              }}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                ${currentItem === i ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${hasErrors ? 'bg-destructive/20 text-destructive' : isDone ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}
              `}
              disabled={phase === 'recording' || phase === 'paused' || phase === 'showing' || phase === 'hidden'}
            >
              {isDone ? '✓' : i + 1}
            </button>
          );
        })}
      </div>

      {/* Main card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6 space-y-5">
          {/* Item number */}
          <div className="text-sm text-muted-foreground text-center font-medium">
            Item {currentItem + 1} / {SPA_ITEMS.length}
          </div>

          {/* === PHASE: READY === */}
          {phase === 'ready' && (
            <div className="text-center space-y-6 py-4">
              <div className="text-lg font-medium text-muted-foreground">
                Prêt pour : <span className="text-foreground font-bold">« {items[currentItem].item} »</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Le mot va s'afficher pendant 5 secondes. Lisez-le silencieusement.<br />
                Puis le mot disparaît et l'enregistrement démarre automatiquement.<br />
                Prononcez-le <strong>3 fois de suite, sans pause, aussi vite que possible</strong>.
              </p>
              <Button onClick={startSequence} size="lg" className="gap-2">
                <Eye className="w-5 h-5" /> Afficher le mot
              </Button>
            </div>
          )}

          {/* === PHASE: SHOWING (5s countdown) === */}
          {phase === 'showing' && (
            <div className="text-center space-y-6 py-8">
              <div className="text-4xl sm:text-5xl font-bold text-primary animate-in fade-in duration-300">
                {items[currentItem].item}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <div className="flex gap-1">
                  {Array.from({ length: DISPLAY_DURATION }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < (DISPLAY_DURATION - countdown) ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-mono text-muted-foreground">{countdown}s</span>
              </div>
              <p className="text-sm text-muted-foreground">Le patient lit silencieusement…</p>
            </div>
          )}

          {/* === PHASE: HIDDEN (word gone, waiting for mic) === */}
          {phase === 'hidden' && (
            <div className="text-center space-y-4 py-8">
              <EyeOff className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Démarrage du micro…</p>
            </div>
          )}

          {/* === PHASE: RECORDING === */}
          {(phase === 'recording' || phase === 'paused') && (
            <div className="text-center space-y-6 py-6">
              <div className="flex items-center justify-center gap-3">
                <div className={`w-4 h-4 rounded-full ${phase === 'recording' ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`} />
                <span className={`text-2xl font-bold ${phase === 'recording' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {phase === 'recording' ? 'Enregistrement' : 'En pause'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Le mot est caché. Le patient répète <strong>3 fois</strong> :</p>
                <p className="text-lg font-mono text-foreground">
                  « _____ , _____ , _____ »
                </p>
              </div>
              <span className={`text-sm font-mono tabular-nums ${phase === 'recording' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {phase === 'recording' ? '● ' : '⏸ '}{formatTime(recordDuration)}
              </span>
              <div className="flex items-center justify-center gap-3">
                {phase === 'recording' ? (
                  <Button onClick={pauseRecording} variant="outline" size="lg" className="gap-2">
                    <Pause className="w-5 h-5" /> Pause
                  </Button>
                ) : (
                  <Button onClick={resumeRecording} variant="default" size="lg" className="gap-2">
                    <Play className="w-5 h-5" /> Reprendre
                  </Button>
                )}
                <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                  <Square className="w-5 h-5" /> Terminer
                </Button>
              </div>
            </div>
          )}

          {/* === PHASE: SCORING === */}
          {phase === 'scoring' && (
            <div className="space-y-5">
              {/* Playback */}
              {items[currentItem].audioUrl && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Button onClick={togglePlayback} size="sm" variant="outline" className="gap-2">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Réécouter'}
                  </Button>
                  <span className="text-sm text-muted-foreground flex-1">
                    Mot : <strong>{items[currentItem].item}</strong>
                  </span>
                  <Button onClick={redoItem} size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                    <RotateCcw className="w-3.5 h-3.5" /> Refaire
                  </Button>
                </div>
              )}

              {/* Error checkboxes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Erreurs observées :</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPA_ERROR_TYPES.map(t => (
                    <label
                      key={t.key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm
                        ${items[currentItem].errors[t.key] ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/30'}
                      `}
                    >
                      <Checkbox
                        checked={items[currentItem].errors[t.key]}
                        onCheckedChange={() => toggleError(currentItem, t.key)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrev}
                  disabled={currentItem === 0}
                >
                  ← Précédent
                </Button>
                {currentItem < SPA_ITEMS.length - 1 ? (
                  <Button size="sm" onClick={goToNext} className="gap-1">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div /> // placeholder for flex alignment
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary totals */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Total erreurs ({scoredCount}/{SPA_ITEMS.length} items cotés)</span>
            <span className="font-bold text-lg">{totalErrors}</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs text-center">
            {SPA_ERROR_TYPES.map(t => (
              <div key={t.key} className="space-y-1">
                <div className="font-medium text-muted-foreground">{t.label}</div>
                <div className={`font-bold ${totals[t.key] > 0 ? 'text-destructive' : ''}`}>{totals[t.key]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sticky next */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={() => onComplete({ items, totals })} className="w-full gap-2 shadow-lg" size="lg">
          Étape suivante — Reformulation <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SPAStep;
