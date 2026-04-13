/**
 * Shared recorder component for battery subtests
 * Provides recording with pause/resume, playback, and duration tracking
 */
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createCompatibleRecorder, createAudioBlob } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { detectBatteryDisfluencies, type BatteryDisfluencyResult } from "@/lib/batteryDisfluencyDetection";

interface Props {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  onDisfluenciesDetected?: (result: BatteryDisfluencyResult) => void;
  minDuration?: number;
  maxDuration?: number;
  label?: string;
  compact?: boolean;
  /** Enable auto disfluency detection after recording */
  autoDetectDisfluencies?: boolean;
}

const BatteryRecorder: React.FC<Props> = ({
  onRecordingComplete,
  onDisfluenciesDetected,
  minDuration = 0,
  maxDuration,
  label = "Enregistrement",
  compact = false,
  autoDetectDisfluencies = false,
}) => {
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'done'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0); // accumulated ms before pause
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = accumulatedRef.current + (Date.now() - startTimeRef.current);
      const secs = Math.round(elapsed / 1000);
      setDuration(secs);
      if (maxDuration && secs >= maxDuration) {
        finishRecording();
      }
    }, 500);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      streamRef.current = stream;
      const recorder = createCompatibleRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      accumulatedRef.current = 0;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = createAudioBlob(chunksRef.current);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const finalDuration = Math.round(accumulatedRef.current / 1000);
        setDuration(finalDuration);
        onRecordingComplete(blob, finalDuration);
        stream.getTracks().forEach(t => t.stop());

        // Auto-analyze disfluencies if enabled
        if (autoDetectDisfluencies && onDisfluenciesDetected) {
          setAnalyzing(true);
          detectBatteryDisfluencies(blob)
            .then(result => {
              if (result) onDisfluenciesDetected(result);
            })
            .catch(err => console.error('Disfluency detection failed:', err))
            .finally(() => setAnalyzing(false));
        }
      };
      
      recorder.start(1000);
      setState('recording');
      setAudioUrl(null);
      startTimer();
    } catch {
      // Permission denied
    }
  }, [maxDuration, onRecordingComplete]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearTimer();
    setState('paused');
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    setState('recording');
    startTimer();
  }, []);

  const finishRecording = useCallback(() => {
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setState('done');
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const resetRecording = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    accumulatedRef.current = 0;
    setState('idle');
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const recommendedHint = maxDuration
    ? `${Math.floor(maxDuration / 60)} min recommandées`
    : undefined;

  return (
    <div className={`flex items-center gap-3 flex-wrap ${compact ? '' : 'p-4 rounded-lg border bg-card'}`}>
      {!compact && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
          {recommendedHint && <span className="text-xs ml-1">({recommendedHint})</span>}
        </span>
      )}
      
      {state === 'idle' && !audioUrl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={startRecording} size="sm" variant="default" className="gap-2">
              <Mic className="w-4 h-4" /> Enregistrer
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lancer l'enregistrement audio du patient</TooltipContent>
        </Tooltip>
      )}

      {(state === 'recording' || state === 'paused') && (
        <>
          <span className="text-xs text-muted-foreground">{label}</span>

          {/* Pause / Reprendre */}
          <Tooltip>
            <TooltipTrigger asChild>
              {state === 'recording' ? (
                <Button onClick={pauseRecording} size="sm" variant="outline" className="gap-1.5">
                  <Pause className="w-3.5 h-3.5" /> Pause
                </Button>
              ) : (
                <Button onClick={resumeRecording} size="sm" variant="default" className="gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Reprendre
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {state === 'recording'
                ? "Mettre en pause — l'enregistrement continue quand vous reprenez"
                : "Reprendre l'enregistrement là où vous vous êtes arrêté"}
            </TooltipContent>
          </Tooltip>

          {/* Arrêter = finaliser */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={finishRecording} size="sm" variant="destructive" className="gap-1.5">
                <Square className="w-3.5 h-3.5" /> Terminer
              </Button>
            </TooltipTrigger>
            <TooltipContent>Arrêter l'enregistrement et passer à la suite</TooltipContent>
          </Tooltip>

          {/* Timer */}
          <span className={`text-sm font-mono tabular-nums ${state === 'recording' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {state === 'recording' && <span className="animate-pulse">● </span>}
            {state === 'paused' && <span>⏸ </span>}
            {formatTime(duration)}
            {maxDuration && <span className="text-muted-foreground"> / {formatTime(maxDuration)}</span>}
          </span>
        </>
      )}

      {state === 'done' && audioUrl && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={togglePlayback} size="sm" variant="outline" className="gap-2">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Réécouter'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Réécouter l'enregistrement avant de valider</TooltipContent>
          </Tooltip>
          <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={resetRecording} size="sm" variant="ghost" className="gap-1">
                <RotateCcw className="w-3 h-3" /> Refaire
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer cet enregistrement et en refaire un</TooltipContent>
          </Tooltip>
          {analyzing && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyse des disfluences…
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default BatteryRecorder;
