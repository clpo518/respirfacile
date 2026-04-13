import { useState, useRef, useCallback, useEffect } from "react";

export type VolumeZone = "calibrating" | "too_low" | "target" | "strong" | "too_loud";

interface VolumeBiofeedbackResult {
  volumeLevel: number;          // 0-1 raw
  volumePercent: number;        // % relative to calibration baseline
  zone: VolumeZone;
  isCalibrated: boolean;
  calibrationProgress: number;  // 0-1 during calibration
  baselineVolume: number;       // calibrated reference
  avgVolume: number;
  maxVolume: number;
  timeInTargetZone: number;     // seconds in target zone
  totalSpeakingTime: number;    // seconds speaking
  isSpeaking: boolean;
  start: (stream: MediaStream) => void;
  stop: () => void;
  resetCalibration: () => void;
}

const CALIBRATION_DURATION_MS = 5000;
const ANALYSIS_INTERVAL = 50;
const VOLUME_THRESHOLD = 0.12;
const SPEAKING_HYSTERESIS_MS = 300;

// Zones relative to calibrated baseline
const ZONE_TOO_LOW = 0.6;      // < 60% of baseline
const ZONE_TARGET_MIN = 0.6;   // 60-130% = target
const ZONE_TARGET_MAX = 1.3;   // 
const ZONE_STRONG_MAX = 1.8;   // 130-180% = strong (good for projection)

export const useVolumeBiofeedback = (): VolumeBiofeedbackResult => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [volumePercent, setVolumePercent] = useState(0);
  const [zone, setZone] = useState<VolumeZone>("calibrating");
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [baselineVolume, setBaselineVolume] = useState(0);
  const [avgVolume, setAvgVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [timeInTargetZone, setTimeInTargetZone] = useState(0);
  const [totalSpeakingTime, setTotalSpeakingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Calibration
  const calibrationStartRef = useRef<number>(0);
  const calibrationSamplesRef = useRef<number[]>([]);
  const isCalibrationDoneRef = useRef(false);

  // Tracking
  const volumeSamplesRef = useRef<number[]>([]);
  const maxVolumeRef = useRef(0);
  const targetZoneTimeRef = useRef(0);
  const speakingTimeRef = useRef(0);
  const lastAnalysisTimeRef = useRef(0);
  const baselineRef = useRef(0);
  
  // Zone debounce (avoid flickering between zones)
  const lastZoneChangeRef = useRef(0);
  const pendingZoneRef = useRef<VolumeZone>("calibrating");
  const ZONE_DEBOUNCE_MS = 800;

  // Speaking hysteresis
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakingRef = useRef(false);

  const getZone = useCallback((percent: number): VolumeZone => {
    if (percent < ZONE_TOO_LOW * 100) return "too_low";
    if (percent <= ZONE_TARGET_MAX * 100) return "target";
    if (percent <= ZONE_STRONG_MAX * 100) return "strong";
    return "too_loud";
  }, []);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);

    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const normalized = dataArrayRef.current[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    const scaled = Math.min(1, rms * 2.5);
    setVolumeLevel(scaled);

    const now = Date.now();
    const dt = lastAnalysisTimeRef.current ? (now - lastAnalysisTimeRef.current) / 1000 : 0;
    lastAnalysisTimeRef.current = now;

    // Speaking detection with hysteresis
    const currentlySpeaking = scaled > VOLUME_THRESHOLD;
    if (currentlySpeaking) {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
      if (!lastSpeakingRef.current) {
        setIsSpeaking(true);
        lastSpeakingRef.current = true;
      }
    } else {
      if (lastSpeakingRef.current && !speakingTimeoutRef.current) {
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
          lastSpeakingRef.current = false;
          speakingTimeoutRef.current = null;
        }, SPEAKING_HYSTERESIS_MS);
      }
    }

    // Calibration phase
    if (!isCalibrationDoneRef.current) {
      const elapsed = now - calibrationStartRef.current;
      setCalibrationProgress(Math.min(1, elapsed / CALIBRATION_DURATION_MS));

      if (scaled > VOLUME_THRESHOLD) {
        calibrationSamplesRef.current.push(scaled);
      }

      if (elapsed >= CALIBRATION_DURATION_MS) {
        const samples = calibrationSamplesRef.current;
        if (samples.length > 10) {
          // Use median for robustness
          const sorted = [...samples].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          baselineRef.current = median;
          setBaselineVolume(median);
          isCalibrationDoneRef.current = true;
          setIsCalibrated(true);
          setCalibrationProgress(1);
        } else {
          // Not enough samples — extend calibration
          calibrationStartRef.current = now;
          calibrationSamplesRef.current = [];
          setCalibrationProgress(0);
        }
      }
      return;
    }

    // Post-calibration tracking
    const baseline = baselineRef.current;
    if (baseline <= 0) return;

    const percent = (scaled / baseline) * 100;
    setVolumePercent(percent);

    const currentZone = getZone(percent);
    // Debounce zone changes to avoid visual flickering
    if (currentZone !== pendingZoneRef.current) {
      pendingZoneRef.current = currentZone;
      lastZoneChangeRef.current = now;
    }
    if (now - lastZoneChangeRef.current >= ZONE_DEBOUNCE_MS || currentZone === pendingZoneRef.current) {
      setZone(pendingZoneRef.current);
    }

    if (currentlySpeaking) {
      volumeSamplesRef.current.push(scaled);
      speakingTimeRef.current += dt;
      setTotalSpeakingTime(speakingTimeRef.current);

      if (scaled > maxVolumeRef.current) {
        maxVolumeRef.current = scaled;
        setMaxVolume(scaled);
      }

      // Track time in target or strong zone (both are "good" for projection)
      if (currentZone === "target" || currentZone === "strong") {
        targetZoneTimeRef.current += dt;
        setTimeInTargetZone(targetZoneTimeRef.current);
      }

      // Running average
      const samples = volumeSamplesRef.current;
      const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
      setAvgVolume(avg);
    }
  }, [getZone]);

  const start = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      
      // Safari resume
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      calibrationStartRef.current = Date.now();
      calibrationSamplesRef.current = [];
      isCalibrationDoneRef.current = false;
      lastAnalysisTimeRef.current = 0;

      intervalRef.current = setInterval(analyze, ANALYSIS_INTERVAL);
    } catch (error) {
      console.error("Failed to start volume biofeedback:", error);
    }
  }, [analyze]);

  const stop = useCallback(() => {
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
  }, []);

  const resetCalibration = useCallback(() => {
    isCalibrationDoneRef.current = false;
    calibrationStartRef.current = Date.now();
    calibrationSamplesRef.current = [];
    volumeSamplesRef.current = [];
    maxVolumeRef.current = 0;
    targetZoneTimeRef.current = 0;
    speakingTimeRef.current = 0;
    setIsCalibrated(false);
    setCalibrationProgress(0);
    setBaselineVolume(0);
    setAvgVolume(0);
    setMaxVolume(0);
    setTimeInTargetZone(0);
    setTotalSpeakingTime(0);
    setZone("calibrating");
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return {
    volumeLevel,
    volumePercent,
    zone,
    isCalibrated,
    calibrationProgress,
    baselineVolume,
    avgVolume,
    maxVolume,
    timeInTargetZone,
    totalSpeakingTime,
    isSpeaking,
    start,
    stop,
    resetCalibration,
  };
};
