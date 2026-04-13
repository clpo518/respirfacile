import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { countSyllablesWord } from '@/lib/syllabify';

/**
 * Word with Deepgram timestamps for precise articulation time calculation
 */
interface WordWithTimestamp {
  word: string;
  start: number;
  end: number;
  syllables: number;
  duration: number;
  isFiller: boolean;
  fillerKey?: string;
  speaker?: number;
}

// French single-word fillers
const SINGLE_FILLERS = new Set(['euh', 'heu', 'hum', 'ben', 'bah', 'bon', 'genre', 'alors', 'voilà', 'quoi', 'e']);
// French two-word fillers
const TWO_WORD_FILLERS = new Set(['du coup', 'en fait', 'tu vois', 'en gros']);

interface FillerDetails {
  [filler: string]: number;
}

interface UseDeepgramSPSOptions {
  detectFillers?: boolean;
  /** Lock the number of speakers for diarization (avoids phantom speakers from noise) */
  maxSpeakers?: number;
}

/** Callback fired immediately when new words arrive (final or interim) */
type OnWordsCallback = (words: WordWithTimestamp[], isFinal: boolean) => void;

interface SpeakerPacketState {
  syllCount: number;
  firstStart: number | null;
  lastEnd: number | null;
}

interface UseDeepgramSPSReturn {
  isConnected: boolean;
  isListening: boolean;
  currentSPS: number;
  /** Packet-based SPS: calculated every PACKET_SIZE (3) syllables for stable, low-latency feedback */
  packetSPS: number;
  /** True once the first 5-syllable packet has been completed */
  isCalibrated: boolean;
  spsHistory: number[];
  syllableCount: number;
  wordCount: number;
  fillerCount: number;
  fillerDetails: FillerDetails;
  actualSpeakingTime: number;
  fluencyRatio: number;
  /** Per-speaker SPS (diarization). Keys are speaker IDs (0, 1, ...) */
  speakerSPS: Record<number, number>;
  /** Incremented each time a new packet SPS is computed — use to detect fresh values */
  packetVersion: number;
  start: (stream: MediaStream, options?: UseDeepgramSPSOptions) => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
  getWordTimestamps: () => WordWithTimestamp[];
  /** Add dead time (ms) to exclude from fluency ratio (e.g. countdown pauses) */
  addPauseOffset: (ms: number) => void;
  /** Register a callback fired instantly when words arrive (zero polling latency) */
  setOnWords: (cb: OnWordsCallback | null) => void;
}

const PACKET_SIZE = 3; // syllables per packet (reduced from 5 for faster response to speed changes)
const SPS_WINDOW_SECONDS = 2;
const SPS_UPDATE_INTERVAL_MS = 100;
const AUDIO_BUFFER_SIZE = 1024;
const MAX_RECONNECT_ATTEMPTS = 2;
const RECONNECT_DELAY_MS = 1000;

export function useDeepgramSPS(): UseDeepgramSPSReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSPS, setCurrentSPS] = useState(0);
  const [spsHistory, setSpsHistory] = useState<number[]>([]);
  const [syllableCount, setSyllableCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerDetails, setFillerDetails] = useState<FillerDetails>({});
  const [actualSpeakingTime, setActualSpeakingTime] = useState(0);
  const [fluencyRatio, setFluencyRatio] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [packetSPS, setPacketSPS] = useState(0);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [speakerSPS, setSpeakerSPS] = useState<Record<number, number>>({});
  const [packetVersion, setPacketVersion] = useState(0);
  const packetSPSRef = useRef(0);
  const packetVersionRef = useRef(0);
  // Packet tracking: accumulate syllables until PACKET_SIZE, then compute SPS
  const packetSyllCountRef = useRef(0);
  const packetFirstStartRef = useRef<number | null>(null);
  const packetLastEndRef = useRef<number | null>(null);
  // Per-speaker packet tracking for diarization
  const speakerPacketsRef = useRef<Map<number, SpeakerPacketState>>(new Map());
  const speakerSPSRef = useRef<Record<number, number>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wordTimestampsRef = useRef<WordWithTimestamp[]>([]);
  const interimWordsRef = useRef<WordWithTimestamp[]>([]);
  const totalSyllablesRef = useRef(0);
  const totalWordsRef = useRef(0);
  const totalArticulationTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const spsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectFillersRef = useRef(false);
  const maxSpeakersRef = useRef<number | undefined>(undefined);
  const fillerCountRef = useRef(0);
  const fillerDetailsRef = useRef<FillerDetails>({});
  // Pause offset: total dead time (ms) to exclude from elapsed time (e.g. rebus countdown)
  const pauseOffsetMsRef = useRef(0);
  // Reconnect state
  const reconnectAttemptsRef = useRef(0);
  const apiKeyRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sendAudioChunkRef = useRef<((data: Float32Array) => void) | null>(null);
  const isStoppingRef = useRef(false);
  const onWordsCallbackRef = useRef<OnWordsCallback | null>(null);
  /**
   * Check if a word is a filler (returns the matched filler key or null)
   */
  const isFiller = useCallback((word: string, previousWord?: string): string | null => {
    const normalized = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    if (SINGLE_FILLERS.has(normalized)) return normalized;
    if (previousWord) {
      const twoWord = `${previousWord.toLowerCase().trim().replace(/[.,!?;:]/g, '')} ${normalized}`;
      if (TWO_WORD_FILLERS.has(twoWord)) return twoWord;
    }
    return null;
  }, []);

  /**
   * Calculate SPS using word timestamps (Articulation Rate)
   * EXCLUDES filler words from syllable count for clinical accuracy.
   * Uses hybrid detection: raw syllable rate + word cadence + gap compression
   * to catch "swallowed words" (fast speech with few recognized syllables).
   */
  const calculateSPS = useCallback(() => {
    const allWords = [...wordTimestampsRef.current, ...interimWordsRef.current];
    if (allWords.length === 0) {
      setCurrentSPS(0);
      return 0;
    }

    // Use Deepgram timestamps directly for window (not wall clock) to avoid drift
    const latestEnd = allWords[allWords.length - 1].end;
    const windowStart = latestEnd - SPS_WINDOW_SECONDS;

    const recentWords = allWords.filter(w => w.end >= windowStart);

    if (recentWords.length === 0) {
      setCurrentSPS(0);
      return 0;
    }

    const spokenWords = recentWords.filter(w => !w.isFiller);

    // Exclude fillers from syllable count for SPS calculation
    const syllablesInWindow = spokenWords.reduce((sum, w) => sum + w.syllables, 0);

    const articulationTimeInWindow = recentWords.reduce((sum, w) => {
      const effectiveStart = Math.max(w.start, windowStart);
      const effectiveEnd = Math.min(w.end, latestEnd);
      return sum + Math.max(0, effectiveEnd - effectiveStart);
    }, 0);

    const rawSps = articulationTimeInWindow > 0.3
      ? syllablesInWindow / articulationTimeInWindow
      : 0;

    // --- Hybrid compression boost (detect "swallowed words") ---
    const windowDuration = Math.max(latestEnd - Math.max(windowStart, 0), 0.1);
    const startedWords = spokenWords.filter(w => w.start >= windowStart && w.start < latestEnd);
    const wordRateEquivalent = (startedWords.length / windowDuration) * 1.8;

    let compressionBoost = 0;
    if (spokenWords.length >= 2) {
      const gaps: number[] = [];
      const durations: number[] = [];
      for (let i = 0; i < spokenWords.length; i++) {
        const dur = Math.max(spokenWords[i].duration || (spokenWords[i].end - spokenWords[i].start), 0.08);
        durations.push(dur);
        if (i > 0) {
          gaps.push(Math.max(0, spokenWords[i].start - spokenWords[i - 1].end));
        }
      }
      const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
      const avgDur = durations.reduce((a, b) => a + b, 0) / durations.length;

      const cadenceEquivalent = avgGap !== null
        ? 1.8 / Math.max(avgDur + Math.max(avgGap, 0.02), 0.2)
        : wordRateEquivalent;

      const gapCompression = avgGap === null ? 0 : Math.min(1, Math.max(0, (0.14 - avgGap) / 0.12));
      const durationCompression = Math.min(1, Math.max(0, (0.36 - avgDur) / 0.18));
      const compressionConfidence = Math.min(1, Math.max(0, Math.max(gapCompression, durationCompression * 0.85)));

      const compressedEquivalent = Math.max(wordRateEquivalent, cadenceEquivalent);
      compressionBoost = Math.max(0, compressedEquivalent - rawSps) * compressionConfidence;
    }

    const effectiveSps = Math.min(12, rawSps + compressionBoost);
    const sps = Math.round(effectiveSps * 10) / 10;

    setCurrentSPS(sps);

    // Fluency ratio uses wall clock elapsed
    const rawElapsed = (Date.now() - startTimeRef.current) / 1000;
    const elapsedSeconds = rawElapsed - (pauseOffsetMsRef.current / 1000);
    setActualSpeakingTime(totalArticulationTimeRef.current);
    const ratio = elapsedSeconds > 0
      ? Math.min(1, Math.round((totalArticulationTimeRef.current / elapsedSeconds) * 100) / 100)
      : 0;
    setFluencyRatio(ratio);

    if (sps > 0 || totalSyllablesRef.current > 0) {
      setSpsHistory(prev => [...prev, sps].slice(-120));
    }

    return sps;
  }, []);

  /**
   * Connect WebSocket to Deepgram (used for initial connect + reconnect)
   */
  const connectWebSocket = useCallback((apiKey: string) => {
      const fillerParam = detectFillersRef.current ? '&filler_words=true' : '';
    const speakerParam = maxSpeakersRef.current
      ? `&diarize_version=latest&min_speakers=${maxSpeakersRef.current}&max_speakers=${maxSpeakersRef.current}`
      : '&diarize_version=latest';
    const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=fr&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000&diarize=true${fillerParam}${speakerParam}`;

    const socket = new WebSocket(wsUrl, ['token', apiKey]);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[DeepgramSPS] WebSocket connected');
      setIsConnected(true);
      setIsListening(true);
      setError(null);
      reconnectAttemptsRef.current = 0;

      if (!spsIntervalRef.current) {
        startTimeRef.current = Date.now();
        spsIntervalRef.current = setInterval(calculateSPS, SPS_UPDATE_INTERVAL_MS);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
          const alternative = data.channel.alternatives[0];
          const words: Array<{ word: string; start: number; end: number; confidence?: number }> = alternative.words || [];
          const transcriptConfidence: number = alternative.confidence || 0;

          if (data.is_final && words.length > 0) {
            interimWordsRef.current = [];

            let segmentSyllables = 0;
            let segmentArticulationTime = 0;
            let prevWord: string | undefined;

            for (const w of words) {
              const syllables = countSyllablesWord(w.word);
              const duration = w.end - w.start;
              const validDuration = duration > 0 && duration < 5 ? duration : 0;

              // Check filler status — only if transcript confidence is sufficient
              // to avoid false positives on low-quality audio segments
              const wordConfidence = w.confidence ?? transcriptConfidence;
              const fillerKey = wordConfidence >= 0.5 ? isFiller(w.word, prevWord) : null;
              const wordIsFiller = fillerKey !== null;

              if (wordIsFiller) {
                fillerCountRef.current += 1;
                fillerDetailsRef.current[fillerKey!] = (fillerDetailsRef.current[fillerKey!] || 0) + 1;
                setFillerCount(fillerCountRef.current);
                setFillerDetails({ ...fillerDetailsRef.current });

                // For two-word fillers, also mark the previous word with the same fillerKey
                if (fillerKey && fillerKey.includes(' ') && wordTimestampsRef.current.length > 0) {
                  const prevEntry = wordTimestampsRef.current[wordTimestampsRef.current.length - 1];
                  prevEntry.isFiller = true;
                  prevEntry.fillerKey = fillerKey;
                }
              }

              wordTimestampsRef.current.push({
                word: w.word,
                start: w.start,
                end: w.end,
                syllables,
                duration: validDuration,
                isFiller: wordIsFiller,
                fillerKey: wordIsFiller ? fillerKey! : undefined,
                speaker: (w as any).speaker
              });

              // Only count non-filler syllables for SPS
              if (!wordIsFiller) {
                segmentSyllables += syllables;
              }
              segmentArticulationTime += validDuration;

              prevWord = w.word;
            }

            totalSyllablesRef.current += segmentSyllables;
            totalWordsRef.current += words.length;
            totalArticulationTimeRef.current += segmentArticulationTime;

            setSyllableCount(totalSyllablesRef.current);
            setWordCount(totalWordsRef.current);
            setActualSpeakingTime(totalArticulationTimeRef.current);

            calculateSPS();

            // Packet-based SPS: use processed words from wordTimestampsRef
            {
              const processed = wordTimestampsRef.current;
              // Only process the words we just added (last `words.length` entries)
              const newEntries = processed.slice(-words.length);
              for (const w of newEntries) {
                if (w.isFiller) continue;
                
                if (packetFirstStartRef.current === null) {
                  packetFirstStartRef.current = w.start;
                }
                packetSyllCountRef.current += w.syllables;
                packetLastEndRef.current = w.end;
                
                if (packetSyllCountRef.current >= PACKET_SIZE) {
                  const packetDuration = packetLastEndRef.current! - packetFirstStartRef.current!;
                  if (packetDuration > 0.1) {
                    const rawPacketSps = packetSyllCountRef.current / packetDuration;
                    // Apply compression boost to packet SPS too
                    const recentFinal = wordTimestampsRef.current.filter(x => !x.isFiller);
                    const last6 = recentFinal.slice(-6);
                    let pBoost = 0;
                    if (last6.length >= 2) {
                      const pGaps: number[] = [];
                      const pDurs: number[] = [];
                      for (let j = 0; j < last6.length; j++) {
                        pDurs.push(Math.max(last6[j].duration || (last6[j].end - last6[j].start), 0.08));
                        if (j > 0) pGaps.push(Math.max(0, last6[j].start - last6[j - 1].end));
                      }
                      const aG = pGaps.length ? pGaps.reduce((a, b) => a + b, 0) / pGaps.length : null;
                      const aD = pDurs.reduce((a, b) => a + b, 0) / pDurs.length;
                      const cadEq = aG !== null ? 1.8 / Math.max(aD + Math.max(aG, 0.02), 0.2) : 0;
                      const wRE = (last6.length / Math.max(last6[last6.length - 1].end - last6[0].start, 0.2)) * 1.8;
                      const gC = aG === null ? 0 : Math.min(1, Math.max(0, (0.14 - aG) / 0.12));
                      const dC = Math.min(1, Math.max(0, (0.36 - aD) / 0.18));
                      const conf = Math.min(1, Math.max(0, Math.max(gC, dC * 0.85)));
                      pBoost = Math.max(0, Math.max(wRE, cadEq) - rawPacketSps) * conf;
                    }
                    const sps = Math.round(Math.min(rawPacketSps + pBoost, 12) * 10) / 10;
                    packetSPSRef.current = sps;
                    setPacketSPS(sps);
                    packetVersionRef.current += 1;
                    setPacketVersion(packetVersionRef.current);
                    if (!isCalibrated) setIsCalibrated(true);
                  }
                  // Reset packet
                  packetSyllCountRef.current = 0;
                  packetFirstStartRef.current = null;
                  packetLastEndRef.current = null;
                }
              }

              // Per-speaker packet SPS (diarization)
              for (const w of newEntries) {
                if (w.isFiller || w.speaker === undefined) continue;
                const sid = w.speaker;
                if (!speakerPacketsRef.current.has(sid)) {
                  speakerPacketsRef.current.set(sid, { syllCount: 0, firstStart: null, lastEnd: null });
                }
                const sp = speakerPacketsRef.current.get(sid)!;
                if (sp.firstStart === null) sp.firstStart = w.start;
                sp.syllCount += w.syllables;
                sp.lastEnd = w.end;
                if (sp.syllCount >= PACKET_SIZE) {
                  const dur = sp.lastEnd! - sp.firstStart!;
                  if (dur > 0.1) {
                    const sps = Math.round(Math.min(sp.syllCount / dur, 12) * 10) / 10;
                    speakerSPSRef.current = { ...speakerSPSRef.current, [sid]: sps };
                    setSpeakerSPS({ ...speakerSPSRef.current });
                  }
                  sp.syllCount = 0;
                  sp.firstStart = null;
                  sp.lastEnd = null;
                }
              }
            }
            // Fire instant callback for zero-latency consumers
            if (onWordsCallbackRef.current) {
              onWordsCallbackRef.current(wordTimestampsRef.current.slice(-words.length), true);
            }

          } else if (!data.is_final && words.length > 0) {
            // Interim: mark fillers but don't count them yet
            let prevW: string | undefined;
            interimWordsRef.current = words.map(w => {
              const duration = w.end - w.start;
              const fillerKey = isFiller(w.word, prevW);
              prevW = w.word;
              return {
                word: w.word,
                start: w.start,
                end: w.end,
                syllables: countSyllablesWord(w.word),
                duration: duration > 0 && duration < 5 ? duration : 0,
                isFiller: fillerKey !== null
              };
            });

            calculateSPS();

            // Low-latency packet preview: check if interim syllables would complete current packet
            {
              const interimNonFiller = interimWordsRef.current.filter(w => !w.isFiller);
              let previewSyllCount = packetSyllCountRef.current;
              let previewFirstStart = packetFirstStartRef.current;
              let previewLastEnd = packetLastEndRef.current;

              for (const w of interimNonFiller) {
                if (previewFirstStart === null) previewFirstStart = w.start;
                previewSyllCount += w.syllables;
                previewLastEnd = w.end;

                if (previewSyllCount >= PACKET_SIZE && previewFirstStart !== null && previewLastEnd !== null) {
                  const dur = previewLastEnd - previewFirstStart;
                  if (dur > 0.1) {
                    const sps = Math.round(Math.min(previewSyllCount / dur, 12) * 10) / 10;
                    packetSPSRef.current = sps;
                    setPacketSPS(sps);
                    if (!isCalibrated) setIsCalibrated(true);
                  }
                  break; // Only preview one packet ahead
                }
              }
            }

            // Fire instant callback for interim words too
            if (onWordsCallbackRef.current) {
              onWordsCallbackRef.current(interimWordsRef.current, false);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing Deepgram message:', e);
      }
    };

    socket.onerror = (e) => {
      console.error('[DeepgramSPS] WebSocket error:', e);
      setError('Connection error');
    };

    socket.onclose = (event: CloseEvent) => {
      console.log(`[DeepgramSPS] WebSocket closed - code: ${event.code}, reason: "${event.reason}", wasClean: ${event.wasClean}`);
      setIsConnected(false);

      // Auto-reconnect on abnormal closure (not user-initiated stop)
      if (!isStoppingRef.current && event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && apiKeyRef.current) {
        reconnectAttemptsRef.current += 1;
        const attempt = reconnectAttemptsRef.current;
        console.log(`[DeepgramSPS] Reconnecting... attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);
        setError(`Reconnexion (${attempt}/${MAX_RECONNECT_ATTEMPTS})...`);

        setTimeout(() => {
          if (!isStoppingRef.current && apiKeyRef.current) {
            connectWebSocket(apiKeyRef.current);
          }
        }, RECONNECT_DELAY_MS * attempt);
      } else if (!isStoppingRef.current && event.code !== 1000) {
        setError(`Connexion perdue (code ${event.code})`);
        setIsListening(false);
      } else {
        setIsListening(false);
      }
    };

    return socket;
  }, [calculateSPS, isFiller]);

  const start = useCallback(async (stream: MediaStream, options?: UseDeepgramSPSOptions) => {
    setError(null);
    isStoppingRef.current = false;
    reconnectAttemptsRef.current = 0;
    detectFillersRef.current = options?.detectFillers ?? false;
    maxSpeakersRef.current = options?.maxSpeakers;
    streamRef.current = stream;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-deepgram-token');

      if (fnError || !data?.apiKey) {
        throw new Error(fnError?.message || 'Failed to get Deepgram token');
      }

      apiKeyRef.current = data.apiKey;

      const socket = connectWebSocket(data.apiKey);

      // Audio capture setup with resampling (Safari-compatible)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      await audioContext.resume();

      const nativeSampleRate = audioContext.sampleRate;
      const targetSampleRate = 16000;
      const source = audioContext.createMediaStreamSource(stream);

      console.log(`[DeepgramSPS] Audio: ${nativeSampleRate}Hz -> ${targetSampleRate}Hz | state: ${audioContext.state}`);

      // Two-pole Butterworth-style low-pass filter + linear interpolation downsampling
      // Two poles = 12 dB/octave rolloff — preserves low-frequency content (male voices ~85-180 Hz)
      // while preventing aliasing artifacts during decimation
      const downsampleFilterState = { s1: 0, s2: 0 };
      const downsample = (buffer: Float32Array, inputRate: number, outputRate: number): Float32Array => {
        if (inputRate === outputRate) return buffer;
        const ratio = inputRate / outputRate;
        // Two-pole low-pass: cutoff at ~outputRate * 0.45 (just below Nyquist)
        const fc = outputRate * 0.45 / inputRate;
        const w = Math.tan(Math.PI * fc);
        const w2 = w * w;
        const r = Math.SQRT2; // Butterworth Q
        const a0 = 1 + r * w + w2;
        const b0 = w2 / a0;
        const b1 = 2 * b0;
        const b2 = b0;
        const a1 = 2 * (w2 - 1) / a0;
        const a2 = (1 - r * w + w2) / a0;

        const filtered = new Float32Array(buffer.length);
        let x1 = 0, x2 = 0;
        let y1 = downsampleFilterState.s1, y2 = downsampleFilterState.s2;
        for (let i = 0; i < buffer.length; i++) {
          const x = buffer[i];
          const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
          x2 = x1; x1 = x;
          y2 = y1; y1 = y;
          filtered[i] = y;
        }
        downsampleFilterState.s1 = y1;
        downsampleFilterState.s2 = y2;

        // Linear interpolation resampling
        const newLength = Math.round(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
          const srcIdx = i * ratio;
          const idx0 = Math.floor(srcIdx);
          const idx1 = Math.min(idx0 + 1, buffer.length - 1);
          const frac = srcIdx - idx0;
          result[i] = filtered[idx0] * (1 - frac) + filtered[idx1] * frac;
        }
        return result;
      };

      const sendAudioChunk = (inputData: Float32Array) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return;
        const resampledData = downsample(inputData, nativeSampleRate, targetSampleRate);
        const int16Data = new Int16Array(resampledData.length);
        for (let i = 0; i < resampledData.length; i++) {
          const s = Math.max(-1, Math.min(1, resampledData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        currentSocket.send(int16Data.buffer);
      };

      sendAudioChunkRef.current = sendAudioChunk;

      let cleanupAudio: () => void;

      try {
        await audioContext.audioWorklet.addModule('/audio-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
        source.connect(workletNode);
        workletNode.connect(audioContext.destination);
        workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
          sendAudioChunk(e.data);
        };
        console.log('[DeepgramSPS] Using AudioWorklet');
        cleanupAudio = () => {
          workletNode.disconnect();
          source.disconnect();
          audioContext.close();
        };
      } catch {
        console.warn('[DeepgramSPS] Falling back to ScriptProcessor');
        const processor = audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, 1, 1);
        processor.onaudioprocess = (e) => {
          sendAudioChunk(e.inputBuffer.getChannelData(0));
        };
        source.connect(processor);
        processor.connect(audioContext.destination);
        cleanupAudio = () => {
          processor.disconnect();
          source.disconnect();
          audioContext.close();
        };
      }

      mediaRecorderRef.current = {
        stop: () => cleanupAudio()
      } as unknown as MediaRecorder;

    } catch (e) {
      console.error('Failed to start Deepgram:', e);
      const msg = e instanceof Error ? e.message : 'Failed to connect';
      setError(msg);
      throw new Error(msg);
    }
  }, [connectWebSocket]);

  const stop = useCallback(() => {
    isStoppingRef.current = true;

    if (spsIntervalRef.current) {
      clearInterval(spsIntervalRef.current);
      spsIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    apiKeyRef.current = null;
    streamRef.current = null;
    sendAudioChunkRef.current = null;
    setIsListening(false);
    setIsConnected(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentSPS(0);
    setSpsHistory([]);
    setSyllableCount(0);
    setWordCount(0);
    setFillerCount(0);
    setFillerDetails({});
    setActualSpeakingTime(0);
    setFluencyRatio(0);
    setError(null);
    wordTimestampsRef.current = [];
    interimWordsRef.current = [];
    totalSyllablesRef.current = 0;
    totalWordsRef.current = 0;
    totalArticulationTimeRef.current = 0;
    startTimeRef.current = 0;
    pauseOffsetMsRef.current = 0;
    fillerCountRef.current = 0;
    fillerDetailsRef.current = {};
    detectFillersRef.current = false;
    reconnectAttemptsRef.current = 0;
    packetSPSRef.current = 0;
    packetSyllCountRef.current = 0;
    packetFirstStartRef.current = null;
    packetLastEndRef.current = null;
    setPacketSPS(0);
    setIsCalibrated(false);
    packetVersionRef.current = 0;
    setPacketVersion(0);
    speakerPacketsRef.current = new Map();
    speakerSPSRef.current = {};
    setSpeakerSPS({});
  }, [stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  const getWordTimestamps = useCallback(() => {
    return [...wordTimestampsRef.current];
  }, []);

  const addPauseOffset = useCallback((ms: number) => {
    pauseOffsetMsRef.current += ms;
  }, []);

  const setOnWords = useCallback((cb: OnWordsCallback | null) => {
    onWordsCallbackRef.current = cb;
  }, []);

  return {
    isConnected,
    isListening,
    currentSPS,
    packetSPS,
    isCalibrated,
    spsHistory,
    syllableCount,
    wordCount,
    fillerCount,
    fillerDetails,
    actualSpeakingTime,
    fluencyRatio,
    speakerSPS,
    packetVersion,
    start,
    stop,
    reset,
    error,
    getWordTimestamps,
    addPauseOffset,
    setOnWords
  };
}
