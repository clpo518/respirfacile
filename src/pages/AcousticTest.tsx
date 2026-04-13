import { useState, useCallback } from "react";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { useAcousticSPS } from "@/hooks/useAcousticSPS";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Mic, Square, ArrowLeft, Volume2, Activity, Timer, Hash, Pause, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getSPSZone } from "@/lib/spsUtils";
import SpeedGaugeBar from "@/components/practice/SpeedGaugeBar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AcousticTest = () => {
  const acoustic = useAcousticSPS();
  const deepgram = useDeepgramSPS();
  const [sharedStream, setSharedStream] = useState<MediaStream | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  const isRunning = acoustic.isActive;
  const targetSPS = 4.0;
  const zone = getSPSZone(acoustic.currentSPS, targetSPS);

  const handleStart = useCallback(async () => {
    setSessionDone(false);
    const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
    setSharedStream(stream);
    // Start both in parallel on the same stream
    await Promise.all([
      acoustic.start(stream),
      deepgram.start(stream).catch(err => console.warn("Deepgram start failed:", err)),
    ]);
  }, [acoustic, deepgram]);

  const handleStop = useCallback(() => {
    acoustic.stop();
    deepgram.stop();
    if (sharedStream) {
      sharedStream.getTracks().forEach(t => t.stop());
      setSharedStream(null);
    }
    setSessionDone(true);
  }, [acoustic, deepgram, sharedStream]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Build chart data from histories
  const maxLen = Math.max(acoustic.spsHistory.length, deepgram.spsHistory.length);
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    time: ((i * 0.5)).toFixed(1),
    acoustique: acoustic.spsHistory[i] ?? null,
    deepgram: deepgram.spsHistory[i] ?? null,
  }));

  // Recap stats
  const acousticAvgSPS = acoustic.spsHistory.length > 0
    ? Math.round((acoustic.spsHistory.reduce((a, b) => a + b, 0) / acoustic.spsHistory.length) * 10) / 10
    : 0;
  const deepgramAvgSPS = deepgram.spsHistory.length > 0
    ? Math.round((deepgram.spsHistory.reduce((a, b) => a + b, 0) / deepgram.spsHistory.length) * 10) / 10
    : 0;
  const spsGap = Math.abs(acousticAvgSPS - deepgramAvgSPS).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Test A/B — Acoustique vs Deepgram</h1>
            <p className="text-sm text-muted-foreground">
              Compare le moteur acoustique local avec la transcription Deepgram en temps réel
            </p>
          </div>
        </div>

        {/* Calibration banner */}
        {acoustic.isCalibrating && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Calibration du bruit ambiant… restez silencieux 2 secondes
              </span>
            </CardContent>
          </Card>
        )}

        {/* Main gauge + record */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <SpeedGaugeBar sps={acoustic.currentSPS} targetSps={targetSPS} />
            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${zone.bgClass} ${zone.colorClass}`}>
                {zone.label}
              </span>
              {acoustic.noiseFloor > 0 && (
                <Badge variant="outline" className="text-xs">
                  Seuil auto: {(acoustic.noiseFloor * 100).toFixed(0)}%
                </Badge>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <div className="relative">
                {isRunning && (
                  <>
                    <motion.div className="absolute inset-0 rounded-full bg-primary/20" initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 rounded-full bg-primary/20" initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                  </>
                )}
                <motion.button
                  onClick={isRunning ? handleStop : handleStart}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isRunning ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {isRunning ? <Square className="w-8 h-8" fill="currentColor" /> : <Mic className="w-8 h-8" />}
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* A/B side-by-side stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Acoustic column */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" /> Acoustique
              </CardTitle>
              <CardDescription className="text-xs">Énergie RMS + filtre vocal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SPS actuel</span>
                <span className="font-bold text-lg">{acoustic.currentSPS.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Syllabes</span>
                <span className="font-semibold">{acoustic.totalSyllables}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temps parole</span>
                <span className="font-semibold">{acoustic.actualSpeakingTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fluidité</span>
                <span className="font-semibold">{(acoustic.fluencyRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pauses</span>
                <span className="font-semibold">{acoustic.pauseCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Deepgram column */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Deepgram
              </CardTitle>
              <CardDescription className="text-xs">Transcription STT Nova-2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SPS actuel</span>
                <span className="font-bold text-lg">{deepgram.currentSPS.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Syllabes</span>
                <span className="font-semibold">{deepgram.syllableCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temps parole</span>
                <span className="font-semibold">{deepgram.actualSpeakingTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fluidité</span>
                <span className="font-semibold">{(deepgram.fluencyRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mots</span>
                <span className="font-semibold">{deepgram.wordCount}</span>
              </div>
              {deepgram.error && (
                <p className="text-xs text-destructive">{deepgram.error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Volume + Sensitivity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Volume (RMS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-secondary rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-destructive"
                  animate={{ width: `${acoustic.volumeLevel * 100}%` }}
                  transition={{ duration: 0.05 }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/60" style={{ left: `${acoustic.threshold * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                RMS: {(acoustic.volumeLevel * 100).toFixed(0)}% — Seuil: {(acoustic.threshold * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" /> Sensibilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={[acoustic.threshold * 100]}
                onValueChange={([v]) => acoustic.setThreshold(v / 100)}
                min={2} max={60} step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Sensible</span>
                <span>{(acoustic.threshold * 100).toFixed(0)}%</span>
                <span>Strict</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time comparison chart */}
        {chartData.length > 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Courbes SPS comparées</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} label={{ value: "sec", position: "insideBottomRight", offset: -5, fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="acoustique" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Acoustique" connectNulls />
                  <Line type="monotone" dataKey="deepgram" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Deepgram" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Timer className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{formatTime(acoustic.elapsed)}</p>
              <p className="text-xs text-muted-foreground">Durée</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Pause className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{acoustic.pauseCount}</p>
              <p className="text-xs text-muted-foreground">Pauses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Hash className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{spsGap}</p>
              <p className="text-xs text-muted-foreground">Écart SPS</p>
            </CardContent>
          </Card>
        </div>

        {/* Recap table after session */}
        {sessionDone && (acoustic.totalSyllables > 0 || deepgram.syllableCount > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Récapitulatif de session</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrique</TableHead>
                    <TableHead className="text-center">Acoustique</TableHead>
                    <TableHead className="text-center">Deepgram</TableHead>
                    <TableHead className="text-center">Écart</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">SPS moyen</TableCell>
                    <TableCell className="text-center">{acousticAvgSPS}</TableCell>
                    <TableCell className="text-center">{deepgramAvgSPS}</TableCell>
                    <TableCell className="text-center">{spsGap}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Syllabes totales</TableCell>
                    <TableCell className="text-center">{acoustic.totalSyllables}</TableCell>
                    <TableCell className="text-center">{deepgram.syllableCount}</TableCell>
                    <TableCell className="text-center">{Math.abs(acoustic.totalSyllables - deepgram.syllableCount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Temps de parole</TableCell>
                    <TableCell className="text-center">{acoustic.actualSpeakingTime.toFixed(1)}s</TableCell>
                    <TableCell className="text-center">{deepgram.actualSpeakingTime.toFixed(1)}s</TableCell>
                    <TableCell className="text-center">{Math.abs(acoustic.actualSpeakingTime - deepgram.actualSpeakingTime).toFixed(1)}s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ratio fluidité</TableCell>
                    <TableCell className="text-center">{(acoustic.fluencyRatio * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-center">{(deepgram.fluencyRatio * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-center">{Math.abs((acoustic.fluencyRatio - deepgram.fluencyRatio) * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Mode A/B :</strong> Les deux moteurs partagent le même flux micro.
              L'acoustique utilise un filtre bandpass 300-3000Hz + calibration auto du bruit ambiant (2s).
              Deepgram utilise la transcription Nova-2 avec timestamps par mot.
              Le graphique superpose les deux courbes SPS échantillonnées toutes les 500ms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcousticTest;
