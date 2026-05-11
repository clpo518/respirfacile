import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Headphones, ArrowRight, Play, Pause, CheckCircle2, Sparkles, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const WaveformMockup = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCursorPos(prev => {
        if (prev >= 100) { setIsPlaying(false); return 0; }
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Generate mock waveform bars
  const waveformBars = Array.from({ length: 60 }, (_, i) => {
    const base = Math.sin(i * 0.3) * 0.3 + 0.5;
    const noise = Math.sin(i * 1.7) * 0.15 + Math.cos(i * 2.3) * 0.1;
    return Math.max(0.1, Math.min(1, base + noise));
  });

  // SPS data points (mock)
  const spsPoints = [
    { x: 0, sps: 0 }, { x: 5, sps: 3.8 }, { x: 12, sps: 4.5 }, { x: 20, sps: 5.2 },
    { x: 28, sps: 6.1 }, { x: 35, sps: 5.8 }, { x: 42, sps: 4.9 }, { x: 50, sps: 5.5 },
    { x: 58, sps: 6.8 }, { x: 65, sps: 7.2 }, { x: 72, sps: 5.1 }, { x: 80, sps: 4.6 },
    { x: 88, sps: 5.0 }, { x: 95, sps: 4.2 }, { x: 100, sps: 0 },
  ];

  const getSpsColor = (sps: number) => {
    if (sps <= 5.5) return "hsl(var(--primary))";
    if (sps <= 6.5) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  // Build SVG path for SPS curve
  const chartW = 100;
  const chartH = 60;
  const maxSps = 8;
  const pathD = spsPoints.map((p, i) => {
    const x = (p.x / 100) * chartW;
    const y = chartH - (p.sps / maxSps) * chartH;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Réécoute augmentée</span>
        </div>
        <span className="text-xs text-muted-foreground">Session du 05/03</span>
      </div>

      {/* Waveform */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative h-16 flex items-center gap-[2px]">
          {waveformBars.map((h, i) => {
            const pos = (i / waveformBars.length) * 100;
            const played = pos < cursorPos;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors duration-150"
                style={{
                  height: `${h * 100}%`,
                  backgroundColor: played ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)",
                }}
              />
            );
          })}
          {/* Cursor */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary transition-[left] duration-75"
            style={{ left: `${cursorPos}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <span className="text-xs text-muted-foreground font-mono">
            0:{String(Math.floor(cursorPos * 0.45)).padStart(2, "0")} / 0:45
          </span>
        </div>
      </div>

      {/* SPS Chart below */}
      <div className="px-4 pb-4">
        <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Courbe SPS synchronisée</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" /> Optimal
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-warning" /> Rapide
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-destructive" /> Trop rapide
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-16" preserveAspectRatio="none">
            {/* Target zone */}
            <rect x={0} y={chartH - (5.5 / maxSps) * chartH} width={chartW} height={((5.5 - 3.5) / maxSps) * chartH} fill="hsl(var(--primary) / 0.08)" />
            {/* Target line */}
            <line x1={0} y1={chartH - (5.0 / maxSps) * chartH} x2={chartW} y2={chartH - (5.0 / maxSps) * chartH} stroke="hsl(var(--primary) / 0.3)" strokeWidth={0.5} strokeDasharray="2 2" />
            {/* SPS curve with gradient segments */}
            {spsPoints.slice(0, -1).map((p, i) => {
              const next = spsPoints[i + 1];
              const x1 = (p.x / 100) * chartW;
              const y1 = chartH - (p.sps / maxSps) * chartH;
              const x2 = (next.x / 100) * chartW;
              const y2 = chartH - (next.sps / maxSps) * chartH;
              const avgSps = (p.sps + next.sps) / 2;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={getSpsColor(avgSps)}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Cursor on SPS chart */}
            <line
              x1={(cursorPos / 100) * chartW}
              y1={0}
              x2={(cursorPos / 100) * chartW}
              y2={chartH}
              stroke="hsl(var(--primary))"
              strokeWidth={0.5}
              opacity={0.6}
            />
          </svg>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">0:00</span>
            <span className="text-[10px] text-muted-foreground">0:45</span>
          </div>
        </div>
      </div>

      {/* Annotation callout */}
      <div className="mx-4 mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
        <Eye className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">À 0:28</span> — accélération détectée (6.8 SPS). Le patient peut réécouter ce passage et s'auto-corriger.
        </p>
      </div>
    </div>
  );
};

export const AugmentedPlaybackSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                <Sparkles className="w-4 h-4" /> Nouveau
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Headphones className="w-4 h-4" /> Réécoute intelligente
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left: description */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                  Réécoute <span className="text-primary">augmentée</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Chaque session enregistrée est accompagnée d'une <strong className="text-foreground">courbe SPS synchronisée</strong> sous la forme d'onde audio.
                  Le patient voit exactement <strong className="text-foreground">où il a accéléré</strong>.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Courbe colorée : bleu = bon débit, orange/rouge = trop rapide",
                    "Synchronisation parfaite : la courbe suit le curseur audio",
                    "Auto-correction : le patient réécoute les passages problématiques",
                    "Suivi longitudinal : comparez les séances au fil du temps",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth?tab=signup">
                    Essayer gratuitement
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>

              {/* Right: interactive mockup */}
              <div className="relative">
                <WaveformMockup />
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl blur-xl -z-10" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
