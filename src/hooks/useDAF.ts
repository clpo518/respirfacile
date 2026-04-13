/**
 * DAF (Delayed Auditory Feedback) Hook
 * 
 * Clinical tool used in speech therapy for cluttering treatment.
 * The user hears their own voice with a slight delay (50-200ms),
 * which forces the brain to slow down speech automatically.
 * 
 * Includes an "Auto" mode that adapts delay based on real-time SPS:
 * - SPS > target × 1.2 → increase delay (up to 250ms)
 * - SPS ≤ target → decrease delay (down to base)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type DAFMode = 'manual' | 'auto';

interface DAFState {
  isEnabled: boolean;
  delayMs: number;
  isActive: boolean;
  mode: DAFMode;
  baseDelayMs: number; // The user-chosen baseline
}

interface UseDAFReturn {
  isDAFEnabled: boolean;
  isDAFActive: boolean;
  delayMs: number;
  mode: DAFMode;
  toggleDAF: () => void;
  setDelayMs: (ms: number) => void;
  setMode: (mode: DAFMode) => void;
  startDAF: (stream: MediaStream) => Promise<void>;
  stopDAF: () => void;
  /** Call this periodically in auto mode with current SPS and target */
  feedSPS: (currentSps: number, targetSps: number) => void;
}

const AUTO_STEP_MS = 10;
const AUTO_MAX_DELAY = 250;
const AUTO_MIN_DELAY = 50;
const AUTO_THRESHOLD_RATIO = 1.2; // SPS > target * 1.2 triggers increase

export function useDAF(defaultDelay: number = 100): UseDAFReturn {
  const [state, setState] = useState<DAFState>({
    isEnabled: false,
    delayMs: defaultDelay,
    isActive: false,
    mode: 'manual',
    baseDelayMs: defaultDelay,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleDAF = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const setDelayMs = useCallback((ms: number) => {
    const clampedMs = Math.max(50, Math.min(300, ms));
    setState(prev => ({ ...prev, delayMs: clampedMs, baseDelayMs: clampedMs }));
    
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = clampedMs / 1000;
    }
  }, []);

  const setMode = useCallback((mode: DAFMode) => {
    setState(prev => {
      // When switching to manual, reset to base delay
      const newDelay = mode === 'manual' ? prev.baseDelayMs : prev.delayMs;
      if (delayNodeRef.current) {
        delayNodeRef.current.delayTime.value = newDelay / 1000;
      }
      return { ...prev, mode, delayMs: newDelay };
    });
  }, []);

  const feedSPS = useCallback((currentSps: number, targetSps: number) => {
    setState(prev => {
      if (!prev.isActive || prev.mode !== 'auto' || targetSps <= 0) return prev;

      let newDelay = prev.delayMs;

      if (currentSps > targetSps * AUTO_THRESHOLD_RATIO) {
        // Speaking too fast → increase delay
        newDelay = Math.min(AUTO_MAX_DELAY, prev.delayMs + AUTO_STEP_MS);
      } else if (currentSps <= targetSps && currentSps > 0) {
        // On or below target → decrease towards base
        newDelay = Math.max(AUTO_MIN_DELAY, Math.max(prev.baseDelayMs, prev.delayMs - AUTO_STEP_MS));
      }

      if (newDelay !== prev.delayMs) {
        if (delayNodeRef.current) {
          delayNodeRef.current.delayTime.value = newDelay / 1000;
        }
        return { ...prev, delayMs: newDelay };
      }
      return prev;
    });
  }, []);

  const startDAF = useCallback(async (stream: MediaStream) => {
    if (!state.isEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const delayNode = audioContext.createDelay(0.5);
      delayNode.delayTime.value = state.delayMs / 1000;
      delayNodeRef.current = delayNode;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.8;
      gainNodeRef.current = gainNode;

      source.connect(delayNode);
      delayNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      setState(prev => ({ ...prev, isActive: true }));
    } catch (error) {
      console.error('Failed to start DAF:', error);
    }
  }, [state.isEnabled, state.delayMs]);

  const stopDAF = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch {}
      sourceNodeRef.current = null;
    }
    if (delayNodeRef.current) {
      try { delayNodeRef.current.disconnect(); } catch {}
      delayNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch {}
      gainNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setState(prev => ({ ...prev, isActive: false, delayMs: prev.baseDelayMs }));
  }, []);

  useEffect(() => {
    return () => { stopDAF(); };
  }, [stopDAF]);

  return {
    isDAFEnabled: state.isEnabled,
    isDAFActive: state.isActive,
    delayMs: state.delayMs,
    mode: state.mode,
    toggleDAF,
    setDelayMs,
    setMode,
    startDAF,
    stopDAF,
    feedSPS,
  };
}
