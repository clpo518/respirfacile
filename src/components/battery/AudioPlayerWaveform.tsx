/**
 * Inline audio player with waveform for battery results
 * Uses WaveSurfer.js — same engine as the rest of the site
 */
import React, { useRef, useState, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface Props {
  audioUrl: string;
  label: string;
  compact?: boolean;
}

const AudioPlayerWaveform: React.FC<Props> = ({ audioUrl, label, compact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--primary) / 0.3)',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--primary))',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: compact ? 32 : 48,
      normalize: true,
    });

    ws.load(audioUrl);
    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });
    ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl, compact]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 shrink-0">
        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={togglePlay}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </Button>
      <div ref={containerRef} className="flex-1 min-w-0" />
      {isReady && (
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
};

export default AudioPlayerWaveform;
