import { useState, useRef, useCallback, useEffect } from "react";

export interface VolumeDataPoint {
  timestamp: number; // seconds since start
  volume: number;    // 0-1
}

interface VolumeAnalyzerResult {
  volumeLevel: number; // 0-1
  isSpeaking: boolean;
  /** Volume history for post-session tension analysis */
  volumeHistory: VolumeDataPoint[];
  startAnalyzing: (stream: MediaStream) => void;
  stopAnalyzing: () => void;
}

const VOLUME_THRESHOLD = 0.25; // Threshold to consider "speaking" (lowered from 0.35 to catch quieter male voices)
const SPEAKING_CONFIRM_MS = 350; // Must exceed threshold for 350ms before flagging as speaking
const ANALYSIS_INTERVAL = 50; // Analyze every 50ms for ultra-responsiveness

export const useVolumeAnalyzer = (): VolumeAnalyzerResult => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const volumeHistoryRef = useRef<VolumeDataPoint[]>([]);
  const startTimeRef = useRef<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Track speaking state with hysteresis to avoid flickering
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakingRef = useRef(false);
  const aboveThresholdSinceRef = useRef<number | null>(null);

  const analyzeVolume = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
    
    // Calculate RMS (root mean square) for accurate volume level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const normalized = dataArrayRef.current[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    
    // Apply some smoothing and scaling
    const scaledVolume = Math.min(1, rms * 2.5);
    setVolumeLevel(scaledVolume);
    
    // Record volume history for post-session tension analysis (every ~200ms = every 4th sample)
    if (startTimeRef.current && volumeHistoryRef.current.length % 4 === 0) {
      volumeHistoryRef.current.push({
        timestamp: (Date.now() - startTimeRef.current) / 1000,
        volume: scaledVolume,
      });
    }
    
    // Determine if speaking with hysteresis
    const currentlySpeaking = scaledVolume > VOLUME_THRESHOLD;
    
    if (currentlySpeaking) {
      // Track how long we've been above threshold
      if (aboveThresholdSinceRef.current === null) {
        aboveThresholdSinceRef.current = Date.now();
      }
      const durationAbove = Date.now() - aboveThresholdSinceRef.current;
      
      // Only flag as speaking after sustained volume for SPEAKING_CONFIRM_MS
      if (durationAbove >= SPEAKING_CONFIRM_MS) {
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
          speakingTimeoutRef.current = null;
        }
        if (!lastSpeakingRef.current) {
          setIsSpeaking(true);
          lastSpeakingRef.current = true;
        }
      }
    } else {
      aboveThresholdSinceRef.current = null;
      // Wait 300ms before declaring "not speaking" to avoid flickering
      if (lastSpeakingRef.current && !speakingTimeoutRef.current) {
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
          lastSpeakingRef.current = false;
          speakingTimeoutRef.current = null;
        }, 300);
      }
    }
  }, []);

  const startAnalyzing = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 512; // Larger FFT for better low-frequency resolution (male voices ~85-180 Hz)
      analyser.smoothingTimeConstant = 0.3; // Fast response
      analyser.minDecibels = -90; // Capture quieter signals (default is -100, but some browsers clip at -80)
      analyser.maxDecibels = -10;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      
      // Start analyzing at high frequency (every 50ms)
      startTimeRef.current = Date.now();
      volumeHistoryRef.current = [];
      intervalRef.current = setInterval(analyzeVolume, ANALYSIS_INTERVAL);
    } catch (error) {
      console.error("Failed to start volume analyzer:", error);
    }
  }, [analyzeVolume]);

  const stopAnalyzing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setVolumeLevel(0);
    setIsSpeaking(false);
    lastSpeakingRef.current = false;
    aboveThresholdSinceRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, [stopAnalyzing]);

  return {
    volumeLevel,
    isSpeaking,
    volumeHistory: volumeHistoryRef.current,
    startAnalyzing,
    stopAnalyzing,
  };
};
