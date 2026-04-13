import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Activity, Clock, BarChart3, Ear, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useState } from "react";
import { wpmToSps } from "@/lib/spsUtils";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface ClinicalMetricsBarProps {
  avgWpm: number;
  maxWpm: number;
  targetWpm?: number | null;
  durationSeconds: number;
  wpmData: WpmDataPoint[];
  wordTimestamps?: WordTimestamp[];
  isTherapist: boolean;
  onIntelligibilityChange?: (value: number) => void;
  savedIntelligibility?: number;
}

const ClinicalMetricsBar = ({
  avgWpm,
  maxWpm,
  targetWpm,
  durationSeconds,
  wpmData,
  wordTimestamps,
  isTherapist,
  onIntelligibilityChange,
  savedIntelligibility,
}: ClinicalMetricsBarProps) => {
  const [intelligibility, setIntelligibility] = useState(savedIntelligibility || 5);

  const avgSps = wpmToSps(avgWpm);
  const maxSps = wpmToSps(maxWpm);
  const targetSps = targetWpm ? wpmToSps(targetWpm) : null;
  
  const spsStatus = avgSps <= 4.5 ? "optimal" : avgSps <= 5.5 ? "elevated" : "high";
  
  const getTargetPerformance = () => {
    if (!targetSps) return null;
    const diff = avgSps - targetSps;
    if (diff <= -0.3) return { label: "Sous la cible", color: "text-green-400", status: "good" };
    if (diff <= 0.3) return { label: "Dans la cible", color: "text-blue-400", status: "target" };
    if (diff <= 1) return { label: "Au-dessus", color: "text-yellow-400", status: "elevated" };
    return { label: "Trop rapide", color: "text-red-400", status: "high" };
  };
  
  const targetPerformance = getTargetPerformance();

  // Calculate pauses from real word timestamps (gaps between words > 0.5s)
  const calculatePausesFromTimestamps = (): number => {
    if (!wordTimestamps || wordTimestamps.length < 2) return 0;
    let pauseCount = 0;
    for (let i = 1; i < wordTimestamps.length; i++) {
      const gap = wordTimestamps[i].start - wordTimestamps[i - 1].end;
      if (gap >= 0.5) {
        pauseCount++;
      }
    }
    return pauseCount;
  };

  // Fallback: estimate pauses from WPM drops
  const calculatePausesFromWpm = (): number => {
    if (wpmData.length < 2) return 0;
    let pauseCount = 0;
    for (let i = 1; i < wpmData.length; i++) {
      if (wpmData[i].wpm < 30 && wpmData[i - 1].wpm > 60) {
        pauseCount++;
      }
    }
    return pauseCount;
  };

  const pauseCount = wordTimestamps && wordTimestamps.length > 1
    ? calculatePausesFromTimestamps()
    : calculatePausesFromWpm();

  const pausesPerMinute = durationSeconds > 0 
    ? Math.round((pauseCount / durationSeconds) * 60 * 10) / 10 
    : 0;

  // Calculate regularity score
  const calculateRegularity = () => {
    if (wpmData.length < 2) return 100;
    const mean = wpmData.reduce((acc, p) => acc + p.wpm, 0) / wpmData.length;
    const variance = wpmData.reduce((acc, p) => acc + Math.pow(p.wpm - mean, 2), 0) / wpmData.length;
    const stdDev = Math.sqrt(variance);
    const regularity = Math.max(0, Math.min(100, 100 - (stdDev / 2)));
    return Math.round(regularity);
  };

  const regularity = calculateRegularity();

  // Trend indicator
  const getTrend = () => {
    if (wpmData.length < 4) return "stable";
    const firstHalf = wpmData.slice(0, Math.floor(wpmData.length / 2));
    const secondHalf = wpmData.slice(Math.floor(wpmData.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b.wpm, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.wpm, 0) / secondHalf.length;
    if (secondAvg < firstAvg - 10) return "improving";
    if (secondAvg > firstAvg + 10) return "accelerating";
    return "stable";
  };

  const trend = getTrend();

  const handleIntelligibilityChange = (value: number[]) => {
    setIntelligibility(value[0]);
    onIntelligibilityChange?.(value[0]);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Vitesse moyenne */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Débit</span>
            </div>
            {trend === "improving" && <TrendingDown className="w-4 h-4 text-green-600" />}
            {trend === "accelerating" && <TrendingUp className="w-4 h-4 text-red-600" />}
            {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold ${
              avgSps <= 4.5 ? "text-green-600" : avgSps <= 5.5 ? "text-yellow-600" : "text-red-600"
            }`}>
              {avgSps}
            </span>
            {targetSps && (
              <span className="text-lg text-muted-foreground">/ {targetSps}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            syllabes par seconde {targetSps ? "(réel / cible)" : ""}
          </div>
          <div className="mt-2 text-xs">
            {targetSps && targetPerformance ? (
              <span className={`px-2 py-0.5 rounded-full ${
                targetPerformance.status === "good" ? "bg-green-100 text-green-700" :
                targetPerformance.status === "target" ? "bg-blue-100 text-blue-700" :
                targetPerformance.status === "elevated" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {targetPerformance.label}
              </span>
            ) : (
              <span className={`px-2 py-0.5 rounded-full ${
                spsStatus === "optimal" ? "bg-green-100 text-green-700" :
                spsStatus === "elevated" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {spsStatus === "optimal" ? "Rythme adapté" :
                 spsStatus === "elevated" ? "Un peu rapide" : "Trop rapide"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pauses respiratoires */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Pauses</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${
            pausesPerMinute >= 3 ? "text-green-600" : pausesPerMinute >= 1.5 ? "text-yellow-600" : "text-red-600"
          }`}>
            {pausesPerMinute}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            pauses / minute
          </div>
          <div className="mt-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full ${
              pausesPerMinute >= 3 ? "bg-green-100 text-green-700" :
              pausesPerMinute >= 1.5 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {pausesPerMinute >= 3 ? "Suffisant" :
               pausesPerMinute >= 1.5 ? "Limite" : "Insuffisant"}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            {!wordTimestamps || wordTimestamps.length < 2
              ? "Estimation (silences non détectés)"
              : `${pauseCount} silence(s) ≥ 0.5s détecté(s)`}
          </div>
        </CardContent>
      </Card>

      {/* Régularité */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <BarChart3 className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Régularité</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${
            regularity >= 70 ? "text-green-600" : regularity >= 50 ? "text-yellow-600" : "text-red-600"
          }`}>
            {regularity}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            constance du rythme
          </div>
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  regularity >= 70 ? "bg-green-500" :
                  regularity >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${regularity}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            {regularity >= 70 ? "Débit régulier" : regularity >= 50 ? "Quelques variations" : "Rythme en dents de scie"}
          </div>
        </CardContent>
      </Card>

      {/* Intelligibilité */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Ear className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Clarté</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${
            intelligibility >= 7 ? "text-green-600" :
            intelligibility >= 5 ? "text-yellow-600" : "text-red-600"
          }`}>
            {intelligibility}/10
          </div>
          <div className="text-xs text-muted-foreground mt-1 mb-2">
            {isTherapist ? "Votre évaluation" : "Noté par l'orthophoniste"}
          </div>
          {isTherapist ? (
            <Slider
              value={[intelligibility]}
              onValueChange={handleIntelligibilityChange}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          ) : (
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-500 ${
                  intelligibility >= 7 ? "bg-green-500" :
                  intelligibility >= 5 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${intelligibility * 10}%` }}
              />
            </div>
          )}
          <div className="text-[10px] text-muted-foreground mt-2">
            {isTherapist ? "Glissez pour noter" : ""}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalMetricsBar;
