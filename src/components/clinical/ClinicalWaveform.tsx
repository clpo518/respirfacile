import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, ZoomIn, ZoomOut, AlertTriangle, BarChart3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import WaveSurfer from "wavesurfer.js";
import { wpmToSps } from "@/lib/spsUtils";
import { analyzeDisfluency, type WordTimestamp, type DisfluencyMarker } from "@/lib/analyzeDisfluency";
import { getAdaptiveThresholds } from "@/lib/spsUtils";
import { buildSpeechRateTimeline } from "@/lib/speechRateTimeline";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface ClinicalWaveformProps {
  audioUrl: string;
  wpmData?: WpmDataPoint[];
  targetSps?: number;
  wordTimestamps?: WordTimestamp[];
}

type SpsStatus = "within_target" | "slightly_fast" | "too_fast";

const BLOCK_MARKER_COLOR = "hsl(280 70% 55%)";

const getSpsColor = (sps: number, targetSps: number) => {
  const diff = sps - targetSps;
  const { good, bad } = getAdaptiveThresholds(targetSps);

  if (diff > bad) {
    return {
      status: "too_fast" as SpsStatus,
      fill: "hsl(var(--destructive) / 0.16)",
      stroke: "hsl(var(--destructive))",
      label: "Trop rapide",
    };
  }

  if (diff > good) {
    return {
      status: "slightly_fast" as SpsStatus,
      fill: "hsl(var(--warning) / 0.16)",
      stroke: "hsl(var(--warning))",
      label: "Au-dessus de la cible",
    };
  }

  return {
    status: "within_target" as SpsStatus,
    fill: "hsl(var(--primary) / 0.08)",
    stroke: "hsl(var(--primary))",
    label: "Dans la cible",
  };
};

/* ─── Standalone SPS Chart (below waveform) ─── */
const SpsChart = ({
  wpmData,
  duration,
  currentTime,
  targetSps,
  width,
  onSeek,
  disfluencyMarkers,
  wordTimestamps,
}: {
  wpmData: WpmDataPoint[];
  duration: number;
  currentTime: number;
  targetSps: number;
  width: number;
  onSeek: (time: number) => void;
  disfluencyMarkers?: DisfluencyMarker[];
  wordTimestamps?: WordTimestamp[];
}) => {
  const hasDisfluencyMarkers = disfluencyMarkers && disfluencyMarkers.length > 0;
  const chartHeight = hasDisfluencyMarkers ? 136 : 120;
  if ((!wpmData.length && !wordTimestamps?.length) || duration <= 0 || width < 50) return null;

  const padding = { top: 12, bottom: 20, left: 32, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = chartHeight - padding.top - padding.bottom;
  const baseY = padding.top + chartH;
  const { good, bad } = getAdaptiveThresholds(targetSps);

  /**
   * Compute SPS at regular time intervals (every 0.5s) using a 2s sliding window
   * over word_timestamps. This gives evenly-spaced, accurate data points.
   */
  const spsData = (() => {
    const computedTimeline = buildSpeechRateTimeline(wordTimestamps, { duration });

    if (computedTimeline.length > 0) {
      return computedTimeline;
    }

    // Fallback: use wpmData
    const timestampsAreIndices = (() => {
      if (wpmData.length <= 2) return false;
      const allSequential = wpmData.every((d, i) => Math.abs(d.timestamp - i) < 0.5);
      if (allSequential) return true;
      const maxTs = wpmData[wpmData.length - 1]?.timestamp ?? 0;
      return maxTs < wpmData.length * 1.5 && maxTs < duration * 0.3;
    })();

    const fallbackPoints = wpmData
      .map((d, i) => ({
        time: timestampsAreIndices
          ? (i / Math.max(wpmData.length - 1, 1)) * duration
          : d.timestamp,
        sps: wpmToSps(d.wpm),
      }))
      .filter((d) => Number.isFinite(d.time) && Number.isFinite(d.sps) && d.time >= 0 && d.time <= duration)
      .sort((a, b) => a.time - b.time);

    return fallbackPoints.map((point, index, array) => {
      const previous = index > 0 ? array[index - 1] : null;
      const next = index < array.length - 1 ? array[index + 1] : null;
      return {
        ...point,
        start: Math.max(0, previous ? (previous.time + point.time) / 2 : point.time),
        end: Math.min(duration, next ? (point.time + next.time) / 2 : point.time),
      };
    });
  })();

  // Filter out leading/trailing silence for cleaner display
  const nonZeroData = spsData.filter(d => d.sps > 0);
  if (!nonZeroData.length) return null;

  const maxSps = Math.max(targetSps + bad + 0.6, ...spsData.map((d) => d.sps), 4) * 1.1;
  const continuityGap = 0.08;

  const points = spsData.map((d) => ({
    x: padding.left + (d.time / duration) * chartW,
    y: padding.top + chartH - (d.sps / maxSps) * chartH,
    time: d.time,
    sps: d.sps,
    start: d.start,
    end: d.end,
  }));

  const measurementSegments: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    if (right.start > left.end + continuityGap) continue;
    measurementSegments.push(`M ${left.x} ${left.y} L ${right.x} ${right.y}`);
  }

  const alertRegions: Array<{ start: number; end: number; status: SpsStatus; fill: string }> = [];
  for (const point of points) {
    const appearance = getSpsColor(point.sps, targetSps);
    if (appearance.status === "within_target") continue;

    const previousRegion = alertRegions[alertRegions.length - 1];
    if (
      previousRegion &&
      previousRegion.status === appearance.status &&
      point.start <= previousRegion.end + 0.05
    ) {
      previousRegion.end = Math.max(previousRegion.end, point.end);
    } else {
      alertRegions.push({
        start: point.start,
        end: point.end,
        status: appearance.status,
        fill: appearance.fill,
      });
    }
  }

  // Filter alert points: only show during actual speech (sps > 0)
  const alertPoints = points.filter((point) => point.sps > 0 && getSpsColor(point.sps, targetSps).status !== "within_target");
  
  // Show a current value only when the cursor is inside real speech, never in silence.
  const currentPointData = (() => {
    if (currentTime <= 0) return null;
    const activeIndex = points.findIndex((point) => currentTime >= point.start && currentTime <= point.end);
    if (activeIndex === -1) return null;

    const active = points[activeIndex];
    const previous = activeIndex > 0 ? points[activeIndex - 1] : null;
    const next = activeIndex < points.length - 1 ? points[activeIndex + 1] : null;

    if (previous && currentTime < active.time && currentTime <= previous.end && active.start <= previous.end + continuityGap) {
      const ratio = (currentTime - previous.time) / Math.max(active.time - previous.time, 0.001);
      const interpSps = previous.sps + (active.sps - previous.sps) * Math.max(0, Math.min(1, ratio));
      const interpY = previous.y + (active.y - previous.y) * Math.max(0, Math.min(1, ratio));
      return { sps: Math.round(interpSps * 10) / 10, x: padding.left + (currentTime / duration) * chartW, y: interpY };
    }

    if (next && currentTime > active.time && currentTime >= next.start - continuityGap && next.start <= active.end + continuityGap) {
      const ratio = (currentTime - active.time) / Math.max(next.time - active.time, 0.001);
      const interpSps = active.sps + (next.sps - active.sps) * Math.max(0, Math.min(1, ratio));
      const interpY = active.y + (next.y - active.y) * Math.max(0, Math.min(1, ratio));
      return { sps: Math.round(interpSps * 10) / 10, x: padding.left + (currentTime / duration) * chartW, y: interpY };
    }

    return { sps: active.sps, x: padding.left + (currentTime / duration) * chartW, y: active.y };
  })();

  const hasSpeechAtCurrentTime = currentPointData !== null;
  const currentSps = currentPointData ? currentPointData.sps : null;
  const currentColor = currentSps !== null ? getSpsColor(currentSps, targetSps) : null;
  const cursorX = padding.left + (currentTime / duration) * chartW;
  const targetY = padding.top + chartH - (targetSps / maxSps) * chartH;
  const yLabels = [0, Math.round((maxSps / 2) * 10) / 10, Math.round(maxSps * 10) / 10];

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - padding.left) / chartW));
    onSeek(ratio * duration);
  };

  return (
    <svg
      width={width}
      height={chartHeight}
      className="cursor-pointer select-none"
      onClick={handleClick}
    >
      <rect
        x={padding.left}
        y={padding.top}
        width={chartW}
        height={chartH}
        fill="hsl(var(--muted) / 0.28)"
        rx={8}
      />

      {(() => {
        const upperY = padding.top + chartH - ((targetSps + good) / maxSps) * chartH;
        const lowerY = padding.top + chartH - (Math.max(0, targetSps - good) / maxSps) * chartH;
        return (
          <rect
            x={padding.left}
            y={upperY}
            width={chartW}
            height={lowerY - upperY}
            fill="hsl(var(--primary) / 0.08)"
            rx={4}
          />
        );
      })()}

      {alertRegions.map((region, index) => {
        const x = padding.left + (region.start / duration) * chartW;
        const widthPx = Math.max(((region.end - region.start) / duration) * chartW, 3);
        return (
          <rect
            key={`alert-${index}`}
            x={x}
            y={padding.top}
            width={widthPx}
            height={chartH}
            fill={region.fill}
            rx={4}
          />
        );
      })}

      <line
        x1={padding.left}
        y1={targetY}
        x2={padding.left + chartW}
        y2={targetY}
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.45}
      />
      <text
        x={padding.left + chartW - 2}
        y={targetY - 5}
        textAnchor="end"
        style={{ fill: "hsl(var(--primary))", fontSize: 9, fontWeight: 600 }}
      >
        Cible {targetSps} syll/s
      </text>

      {measurementSegments.map((segment, index) => (
        <path
          key={`segment-${index}`}
          d={segment}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}

      {alertPoints.map((point, index) => {
        const appearance = getSpsColor(point.sps, targetSps);
        return (
          <circle
            key={`alert-point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={appearance.stroke}
            stroke="hsl(var(--card))"
            strokeWidth={1.5}
          />
        );
      })}

      {disfluencyMarkers && wordTimestamps && disfluencyMarkers.map((marker, i) => {
        const wt = wordTimestamps[marker.wordIndex];
        if (!wt) return null;
        const markerTime = marker.type === "block" ? wt.start : (wt.start + wt.end) / 2;
        const mx = padding.left + (markerTime / duration) * chartW;
        if (mx < padding.left || mx > padding.left + chartW) return null;

        const colors: Record<string, string> = {
          repetition: "hsl(var(--warning))",
          prolongation: "hsl(271 81% 56%)",
          block: BLOCK_MARKER_COLOR,
        };
        const labels: Record<string, string> = {
          repetition: "Répétition",
          prolongation: "Allongement",
          block: "Blocage",
        };
        const color = colors[marker.type] || "hsl(var(--muted-foreground))";
        const tooltipText = marker.type === "repetition"
          ? `${labels[marker.type]} : « ${marker.word} » répété ${marker.count}×`
          : marker.type === "prolongation"
          ? `${labels[marker.type]} : « ${marker.word} » tenu ${marker.duration?.toFixed(1)}s`
          : `${labels[marker.type]} : silence de ${marker.duration?.toFixed(1)}s avant « ${marker.word} »`;

        return (
          <g key={`dis-${i}`}>
            <rect
              x={mx - 3.5}
              y={baseY + 4.5}
              width={7}
              height={7}
              rx={1.5}
              fill={color}
              opacity={0.95}
              transform={`rotate(45 ${mx} ${baseY + 8})`}
            />
            <title>{tooltipText}</title>
          </g>
        );
      })}

      {currentTime > 0 && hasSpeechAtCurrentTime && (
        <>
          <line
            x1={cursorX}
            y1={padding.top}
            x2={cursorX}
            y2={baseY}
            stroke="hsl(var(--foreground) / 0.45)"
            strokeWidth={1.5}
          />
          {currentPointData && currentColor && currentSps !== null && (
            <>
              <circle
                cx={currentPointData.x}
                cy={currentPointData.y}
                r={6}
                fill="none"
                stroke={currentColor.stroke}
                strokeWidth={2}
              />
              <rect
                x={Math.min(Math.max(currentPointData.x - 24, 0), width - 48)}
                y={padding.top - 1}
                width={48}
                height={18}
                rx={9}
                fill={currentColor.stroke}
              />
              <text
                x={Math.min(Math.max(currentPointData.x, 24), width - 24)}
                y={padding.top + 12}
                textAnchor="middle"
                style={{ fill: "hsl(var(--primary-foreground))", fontSize: 10, fontWeight: 700 }}
              >
                {currentSps.toFixed(1)}
              </text>
            </>
          )}
        </>
      )}

      {yLabels.map((val, index) => {
        const y = padding.top + chartH - (val / maxSps) * chartH;
        return (
          <text
            key={index}
            x={padding.left - 4}
            y={y + 3}
            textAnchor="end"
            style={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
          >
            {val}
          </text>
        );
      })}

      <line
        x1={padding.left}
        y1={baseY}
        x2={padding.left + chartW}
        y2={baseY}
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
    </svg>
  );
};

/* ─── Live Waveform Fallback (Safari / iOS) ─── */
const LiveWaveformFallback = ({
  audioUrl,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  isPlayingExternal,
}: {
  audioUrl: string;
  onTimeUpdate: (t: number) => void;
  onDurationChange: (d: number) => void;
  onPlayStateChange: (p: boolean) => void;
  isPlayingExternal: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => onDurationChange(audio.duration || 0);
    const handleTime = () => onTimeUpdate(audio.currentTime);
    const handlePlay = () => onPlayStateChange(true);
    const handlePause = () => onPlayStateChange(false);
    const handleEnded = () => onPlayStateChange(false);

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, onDurationChange, onPlayStateChange]);

  const initAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    } catch (e) {
      console.warn("Live waveform analyser init failed:", e);
    }
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(248, 250, 252, 0.3)";
      ctx.fillRect(0, 0, W, H);

      const barWidth = (W / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * H * 0.85;
        const hue = 145 + (dataArray[i] / 255) * 30; // green range
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
        ctx.fillRect(x, H - barHeight, barWidth - 1, barHeight);
        x += barWidth;
        if (x > W) break;
      }
    };

    draw();
  }, []);

  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    initAnalyser();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (audio.paused) {
      audio.play();
      drawWaveform();
    } else {
      audio.pause();
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [initAnalyser, drawWaveform]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="w-full max-w-sm space-y-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full rounded-lg bg-slate-100"
        style={{ height: 80 }}
      />
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTogglePlay}
          className="gap-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
        >
          {isPlayingExternal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlayingExternal ? "Pause" : "Écouter"}
        </Button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const ClinicalWaveform = ({ audioUrl, wpmData, targetSps: propTargetSps, wordTimestamps }: ClinicalWaveformProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  // spsContainerRef removed — using callback ref instead
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(50);
  const [showSpsChart, setShowSpsChart] = useState(true);
  const [spsContainerWidth, setSpsContainerWidth] = useState(0);
  const [showSpsHint, setShowSpsHint] = useState(() => {
    return !localStorage.getItem("sps_overlay_hint_dismissed");
  });

  const hasSpsData = wpmData && wpmData.length > 0;

  const targetSps = useMemo(() => {
    if (propTargetSps) return propTargetSps;
    return 5.0;
  }, [propTargetSps]);

  // Compute disfluency markers and burst zones
  const disfluencyAnalysis = useMemo(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return null;
    return analyzeDisfluency(wordTimestamps);
  }, [wordTimestamps]);


  // Observe SPS container width — use callback ref to handle conditional rendering
  const spsResizeObserverRef = useRef<ResizeObserver | null>(null);
  const spsContainerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // Cleanup previous observer
    if (spsResizeObserverRef.current) {
      spsResizeObserverRef.current.disconnect();
      spsResizeObserverRef.current = null;
    }
    if (node) {
      // Immediate measurement
      setSpsContainerWidth(node.getBoundingClientRect().width);
      // Observe future resizes
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSpsContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      spsResizeObserverRef.current = observer;
    }
  }, []);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    setIsReady(false);
    setLoadError(false);
    let isMounted = true;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#A7F3D0",
      progressColor: "#10B981",
      cursorColor: "#1e293b",
      cursorWidth: 1,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 100,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurfer.on("ready", () => {
      if (!isMounted) return;
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume / 100);
    });

    wavesurfer.on("audioprocess", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("seeking", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("play", () => isMounted && setIsPlaying(true));
    wavesurfer.on("pause", () => isMounted && setIsPlaying(false));
    wavesurfer.on("finish", () => isMounted && setIsPlaying(false));
    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      if (isMounted) setLoadError(true);
    });

    const timeout = setTimeout(() => {
      if (isMounted && !wavesurferRef.current?.getDuration()) {
        setLoadError(true);
      }
    }, 15000);

    wavesurfer.load(audioUrl);
    wavesurferRef.current = wavesurfer;

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.pause();
          wavesurferRef.current.destroy();
        } catch (e) { /* ignore */ }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setVolume(volume / 100);
    }
  }, [volume, isReady]);

  useEffect(() => {
    if (wavesurferRef.current && isReady && duration > 0) {
      try { wavesurferRef.current.zoom(zoom); } catch (e) { /* ignore */ }
    }
  }, [zoom, isReady, duration]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const restart = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(0);
      setCurrentTime(0);
    }
  }, []);

  const seekToTime = useCallback((time: number) => {
    if (wavesurferRef.current && duration > 0) {
      wavesurferRef.current.seekTo(time / duration);
      setCurrentTime(time);
    }
  }, [duration]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (wavesurferRef.current && duration > 0) {
      wavesurferRef.current.seekTo(value[0] / 100);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  return (
    <Card className="overflow-hidden border border-slate-100 bg-white rounded-2xl shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              Analyse Audio
            </CardTitle>
            <CardDescription className="text-slate-500">
              {showSpsChart && hasSpsData
                ? "Écoutez et visualisez votre vitesse de parole"
                : "Visualisez les pauses et l'intensité vocale"
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {hasSpsData && (
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <Label htmlFor="sps-chart" className="text-xs text-slate-500 cursor-pointer hidden sm:inline">
                  Courbe SPS
                </Label>
                <Switch
                  id="sps-chart"
                  checked={showSpsChart}
                  onCheckedChange={setShowSpsChart}
                />
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-slate-400 font-mono w-10 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* SPS first-use hint */}
        {showSpsHint && showSpsChart && hasSpsData && isReady && (
          <div className="mx-4 mt-4 mb-0 flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-lg shrink-0">💡</span>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Comment lire la courbe ?</p>
              <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
                La ligne combine les syllabes reconnues et la cadence des mots pour mieux repérer les accélérations, même quand des syllabes sont avalées.
                Les zones <span className="text-amber-600 font-medium">orange</span> et <span className="text-red-600 font-medium">rouge</span> signalent uniquement les moments au-dessus de la cible.
                Le repère <span className="font-medium" style={{ color: 'hsl(280 70% 55%)' }}>violet</span> indique un blocage, pas une accélération.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSpsHint(false);
                localStorage.setItem("sps_overlay_hint_dismissed", "1");
              }}
              className="text-blue-400 hover:text-blue-600 text-lg leading-none shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        )}

        {/* Waveform */}
        <div className="relative bg-slate-50 p-4 rounded-lg mx-4 mt-4">
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20 rounded-lg gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <p className="text-xs text-slate-600 font-medium text-center">
                Visualisation alternative (format non supporté nativement)
              </p>
              {/* Live waveform fallback using AnalyserNode */}
              <LiveWaveformFallback
                audioUrl={audioUrl}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                onPlayStateChange={setIsPlaying}
                isPlayingExternal={isPlaying}
              />
            </div>
          ) : !isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20 rounded-lg">
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Chargement de l'audio...</span>
              </div>
            </div>
          )}

          <div
            ref={waveformRef}
            className="w-full overflow-x-auto"
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* SPS Chart — separate panel below waveform */}
        {showSpsChart && hasSpsData && isReady && (
          <div ref={spsContainerCallbackRef} className="mx-4 mt-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden" style={{ minHeight: '140px' }}>
            <div className="flex items-center gap-2 px-3 pt-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-medium text-slate-600">Vitesse de parole estimée</span>
            </div>
            <SpsChart
              wpmData={wpmData!}
              duration={duration}
              currentTime={currentTime}
              targetSps={targetSps}
              width={spsContainerWidth}
              onSeek={seekToTime}
            />
            {/* Disfluency marker legend */}
            {disfluencyAnalysis && disfluencyAnalysis.markers.length > 0 && (
              <div className="px-3 pb-2 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-slate-500">Hésitations</span>
                {disfluencyAnalysis.summary.repetitions > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                    Répétitions
                  </span>
                )}
                {disfluencyAnalysis.summary.prolongations > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    Allongements
                  </span>
                )}
                {disfluencyAnalysis.summary.blocks >= 3 && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'hsl(280 70% 55%)' }} />
                    Blocages
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Time markers */}
        <div className="flex justify-between text-xs text-slate-400 font-mono mx-4 mt-2 px-1">
          <span>0:00</span>
          <span>{formatTime(duration / 4)}</span>
          <span>{formatTime(duration / 2)}</span>
          <span>{formatTime((duration * 3) / 4)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono w-12">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
              disabled={!isReady}
            />
            <span className="text-xs text-slate-500 font-mono w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                disabled={!isReady}
                className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={restart}
                disabled={!isReady}
                className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <Slider
                value={[volume]}
                onValueChange={(val) => setVolume(val[0])}
                max={100}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 flex items-center gap-4 flex-wrap text-xs text-slate-500">
          {showSpsChart && hasSpsData ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                <span>Mesures détectées</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }} />
                <span>Un peu rapide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }} />
                <span>Trop rapide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rotate-45 rounded-sm" style={{ backgroundColor: 'hsl(280 70% 55%)' }} />
                <span>Blocage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded-full border-dashed border" style={{ width: 16, backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary) / 0.45)' }} />
                <span>Cible</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm bg-emerald-500" />
                <span>Déjà lu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm bg-emerald-200" />
                <span>À lire</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="italic">Pics = intensité vocale</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicalWaveform;
