import { useState, useRef, useCallback, useEffect } from "react";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";

export interface AcousticSPSResult {
  currentSPS: number;
  totalSyllables: number;
  volumeLevel: number;
  isActive: boolean;
  threshold: number;
  setThreshold: (value: number) => void;
  start: (stream?: MediaStream) => Promise<void>;
  stop: () => void;
  elapsed: number;
  syllableTimestamps: number[];
  spsHistory: number[];
  actualSpeakingTime: number;
  fluencyRatio: number;
  pauseCount: number;
  isCalibrating: boolean;
  noiseFloor: number;
  rawRms: number;
}

const DEBOUNCE_MS = 120;
const SLIDING_WINDOW_SEC = 3;
const DEFAULT_THRESHOLD = 0.15;
const FFT_SIZE = 256;
const SMOOTHING = 0.3;
const CALIBRATION_DURATION_MS = 1500;
const PAUSE_THRESHOLD_MS = 500;
const HISTORY_INTERVAL_MS = 500;
// Onset detection: we detect syllables as local energy rises
// A syllable onset = energy increased by ONSET_RATIO relative to recent trough
const ONSET_RATIO = 1.6;  // energy must rise 60% above recent trough
const ENVELOPE_ATTACK = 0.15;
const ENVELOPE_RELEASE = 0.01;

export const useAcousticSPS = (): AcousticSPSResult => {
  const [currentSPS, setCurrentSPS] = useState(0);
  const [totalSyllables, setTotalSyllables] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [elapsed, setElapsed] = useState(0);
  const [syllableTimestamps, setSyllableTimestamps] = useState<number[]>([]);
  const [spsHistory, setSpsHistory] = useState<number[]>([]);
  const [actualSpeakingTime, setActualSpeakingTime] = useState(0);
  const [fluencyRatio, setFluencyRatio] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [noiseFloor, setNoiseFloor] = useState(0);
  const [rawRms, setRawRms] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ownStreamRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const thresholdRef = useRef(DEFAULT_THRESHOLD);
  const syllableTimestampsRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef(0);
  const wasBelowRef = useRef(true);
  const startTimeRef = useRef(0);
  // Onset detection refs
  const envelopeRef = useRef(0);
  const troughRef = useRef(1);       // tracks the local minimum energy
  const onsetArmedRef = useRef(true); // ready to detect next onset
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const historyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calibrationStartRef = useRef(0);
  const calibrationSamplesRef = useRef<number[]>([]);
  const isCalibratingRef = useRef(false);

  const lastSpeechTimeRef = useRef(0);
  const pauseCountRef = useRef(0);
  const totalSpeechTimeRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const speechStartRef = useRef(0);

  const currentSPSRef = useRef(0);
  const debugCountRef = useRef(0);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);

    // RMS over ALL frequency bins (proven to work in v1)
    let sum = 0;
    const data = dataArrayRef.current;
    for (let i = 0; i < data.length; i++) {
      const norm = data[i] / 255;
      sum += norm * norm;
    }
    const rms = Math.sqrt(sum / data.length);
    const scaled = Math.min(1, rms * 2.5);
    setVolumeLevel(scaled);
    setRawRms(rms);

    // Debug: log every 60 frames (~1s)
    debugCountRef.current++;
    if (debugCountRef.current % 60 === 0) {
      const maxVal = Math.max(...Array.from(data));
      console.log(`[AcousticSPS] rms=${rms.toFixed(4)} scaled=${scaled.toFixed(3)} threshold=${thresholdRef.current.toFixed(3)} maxBin=${maxVal} syllables=${syllableTimestampsRef.current.length} calibrating=${isCalibratingRef.current}`);
    }

    const now = performance.now();

    // --- Calibration phase ---
    if (isCalibratingRef.current) {
      calibrationSamplesRef.current.push(scaled);
      if (now - calibrationStartRef.current >= CALIBRATION_DURATION_MS) {
        const samples = calibrationSamplesRef.current;
        const avgLevel = samples.reduce((a, b) => a + b, 0) / samples.length;
        // Threshold = noise floor + small margin, capped reasonably
        const floor = Math.max(0.03, Math.min(0.20, avgLevel + 0.03));
        setNoiseFloor(floor);
        setThreshold(floor);
        thresholdRef.current = floor;
        isCalibratingRef.current = false;
        setIsCalibrating(false);
        lastSpeechTimeRef.current = now;
        console.log(`[AcousticSPS] ✅ Calibration done: avgScaled=${avgLevel.toFixed(4)}, threshold=${floor.toFixed(4)} (${(floor*100).toFixed(1)}%)`);
      }
      rafRef.current = requestAnimationFrame(analyze);
      return;
    }

    const currentThreshold = thresholdRef.current;

    // --- Onset detection: detect syllable nuclei via energy rises ---
    // Track envelope (smoothed energy level)
    const envelope = envelopeRef.current;
    if (scaled > envelope) {
      envelopeRef.current = envelope + ENVELOPE_ATTACK * (scaled - envelope);
    } else {
      envelopeRef.current = envelope + ENVELOPE_RELEASE * (scaled - envelope);
    }
    
    // Track trough (local minimum since last onset)
    if (scaled < troughRef.current) {
      troughRef.current = scaled;
    }
    
    // Detect onset: energy rose significantly above recent trough AND above noise floor
    const isAboveNoise = scaled >= currentThreshold;
    const riseFromTrough = troughRef.current > 0.001 
      ? scaled / troughRef.current 
      : (scaled > currentThreshold ? ONSET_RATIO + 1 : 0);
    
    if (isAboveNoise && riseFromTrough >= ONSET_RATIO && onsetArmedRef.current) {
      if (now - lastPeakTimeRef.current >= DEBOUNCE_MS) {
        lastPeakTimeRef.current = now;
        syllableTimestampsRef.current = [...syllableTimestampsRef.current, now];
        setSyllableTimestamps([...syllableTimestampsRef.current]);
        setTotalSyllables(syllableTimestampsRef.current.length);
      }
      onsetArmedRef.current = false;
      troughRef.current = scaled; // reset trough to current level
    }
    
    // Re-arm when energy drops back (fell by 30% from envelope)
    if (!onsetArmedRef.current && scaled < envelopeRef.current * 0.7) {
      onsetArmedRef.current = true;
      troughRef.current = scaled;
    }

    // --- Speech/pause tracking ---
    if (scaled >= currentThreshold * 0.8) {
      if (!isSpeakingRef.current) {
        if (lastSpeechTimeRef.current > 0 && (now - lastSpeechTimeRef.current) >= PAUSE_THRESHOLD_MS) {
          pauseCountRef.current++;
          setPauseCount(pauseCountRef.current);
        }
        isSpeakingRef.current = true;
        speechStartRef.current = now;
      }
      lastSpeechTimeRef.current = now;
    } else if (isSpeakingRef.current && (now - lastSpeechTimeRef.current) >= PAUSE_THRESHOLD_MS) {
      totalSpeechTimeRef.current += (lastSpeechTimeRef.current - speechStartRef.current) / 1000;
      isSpeakingRef.current = false;
      setActualSpeakingTime(totalSpeechTimeRef.current);
    }

    // --- SPS sliding window ---
    const windowStart = now - SLIDING_WINDOW_SEC * 1000;
    const recentSyllables = syllableTimestampsRef.current.filter(t => t >= windowStart);

    if (recentSyllables.length >= 2) {
      const windowDuration = (now - Math.max(windowStart, recentSyllables[0])) / 1000;
      if (windowDuration > 0.3) {
        const sps = Math.round((recentSyllables.length / windowDuration) * 10) / 10;
        const capped = Math.min(sps, 12);
        setCurrentSPS(capped);
        currentSPSRef.current = capped;
      }
    } else if (recentSyllables.length <= 0) {
      setCurrentSPS(0);
      currentSPSRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = useCallback(async (externalStream?: MediaStream) => {
    try {
      let stream: MediaStream;
      if (externalStream) {
        stream = externalStream;
        ownStreamRef.current = false;
      } else {
        stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
        ownStreamRef.current = true;
      }
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;

      // Direct: source -> analyser (no filters, proven to work)
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      // Reset
      syllableTimestampsRef.current = [];
      setSyllableTimestamps([]);
      setTotalSyllables(0);
      setCurrentSPS(0);
      currentSPSRef.current = 0;
      setVolumeLevel(0);
      setRawRms(0);
      setElapsed(0);
      setSpsHistory([]);
      setActualSpeakingTime(0);
      setFluencyRatio(0);
      setPauseCount(0);
      pauseCountRef.current = 0;
      totalSpeechTimeRef.current = 0;
      isSpeakingRef.current = false;
      lastSpeechTimeRef.current = 0;
      lastPeakTimeRef.current = 0;
      wasBelowRef.current = true;
      envelopeRef.current = 0;
      troughRef.current = 1;
      onsetArmedRef.current = true;
      debugCountRef.current = 0;
      startTimeRef.current = Date.now();

      // Start calibration
      calibrationSamplesRef.current = [];
      calibrationStartRef.current = performance.now();
      isCalibratingRef.current = true;
      setIsCalibrating(true);
      setNoiseFloor(0);

      setIsActive(true);

      // Elapsed + fluency timer
      elapsedIntervalRef.current = setInterval(() => {
        const elSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(elSec);
        if (elSec > 0) {
          let speech = totalSpeechTimeRef.current;
          if (isSpeakingRef.current) {
            speech += (performance.now() - speechStartRef.current) / 1000;
          }
          setActualSpeakingTime(Math.round(speech * 10) / 10);
          setFluencyRatio(Math.round((speech / elSec) * 100) / 100);
        }
      }, 1000);

      // SPS history
      historyIntervalRef.current = setInterval(() => {
        setSpsHistory(prev => [...prev, currentSPSRef.current].slice(-240));
      }, HISTORY_INTERVAL_MS);

      rafRef.current = requestAnimationFrame(analyze);

      console.log(`[AcousticSPS] 🚀 Started: FFT=${FFT_SIZE}, bins=${analyser.frequencyBinCount}, sampleRate=${ctx.sampleRate}, stream tracks=${stream.getAudioTracks().length}, track enabled=${stream.getAudioTracks()[0]?.enabled}`);
    } catch (err) {
      console.error("Failed to start acoustic SPS:", err);
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (elapsedIntervalRef.current) { clearInterval(elapsedIntervalRef.current); elapsedIntervalRef.current = null; }
    if (historyIntervalRef.current) { clearInterval(historyIntervalRef.current); historyIntervalRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (streamRef.current && ownStreamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); }
    streamRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    if (isSpeakingRef.current) {
      totalSpeechTimeRef.current += (performance.now() - speechStartRef.current) / 1000;
      isSpeakingRef.current = false;
    }
    setIsActive(false);
  }, []);

  useEffect(() => { return () => { stop(); }; }, [stop]);

  return {
    currentSPS, totalSyllables, volumeLevel, isActive, threshold, setThreshold,
    start, stop, elapsed, syllableTimestamps, spsHistory, actualSpeakingTime,
    fluencyRatio, pauseCount, isCalibrating, noiseFloor, rawRms,
  };
};
