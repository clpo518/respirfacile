import { useMemo } from "react";
import { wpmToSps, getAdaptiveThresholds } from "@/lib/spsUtils";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";
import { buildSpeechRateTimeline } from "@/lib/speechRateTimeline";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface SpeedComplianceBarProps {
  wpmData: WpmDataPoint[];
  targetSps: number;
  /** Show therapist labels (more clinical) vs patient labels (more encouraging) */
  isTherapist?: boolean;
  /** Word-level timestamps for precise analysis (preferred over wpmData) */
  wordTimestamps?: WordTimestamp[];
}

interface ZoneInfo {
  key: string;
  label: string;
  color: string;
  percentage: number;
}

const SpeedComplianceBar = ({ wpmData, targetSps, isTherapist = false, wordTimestamps }: SpeedComplianceBarProps) => {
  const zones = useMemo(() => {
    if (targetSps <= 0) return null;

    const { good, bad } = getAdaptiveThresholds(targetSps);

    let tooSlow = 0;
    let onTarget = 0;
    let slightlyFast = 0;
    let tooFast = 0;

    const timeline = buildSpeechRateTimeline(wordTimestamps);

    if (timeline.length > 0) {
      for (const sample of timeline) {
        const weight = Math.max(sample.end - sample.start, 0.01);
        const diff = sample.sps - targetSps;

        if (diff > bad) tooFast += weight;
        else if (diff > good) slightlyFast += weight;
        else if (sample.sps < targetSps * 0.5) tooSlow += weight;
        else onTarget += weight;
      }
    } else {
      // Fallback to wpmData
      if (!wpmData || wpmData.length < 2) return null;

      for (const point of wpmData) {
        const sps = wpmToSps(point.wpm);
        if (sps === 0) continue;
        const diff = sps - targetSps;

        if (diff > bad) tooFast++;
        else if (diff > good) slightlyFast++;
        else if (sps < targetSps * 0.5) tooSlow++;
        else onTarget++;
      }
    }

    const total = tooSlow + onTarget + slightlyFast + tooFast;
    if (total === 0) return null;

    const result: ZoneInfo[] = [];

    if (onTarget > 0) result.push({
      key: "target",
      label: "Dans la cible",
      color: "bg-emerald-500",
      percentage: Math.round((onTarget / total) * 100),
    });
    if (slightlyFast > 0) result.push({
      key: "slight",
      label: isTherapist ? "Légèrement rapide" : "Un peu rapide",
      color: "bg-amber-400",
      percentage: Math.round((slightlyFast / total) * 100),
    });
    if (tooFast > 0) result.push({
      key: "fast",
      label: "Trop rapide",
      color: "bg-red-500",
      percentage: Math.round((tooFast / total) * 100),
    });
    if (tooSlow > 0) result.push({
      key: "slow",
      label: "Très posé",
      color: "bg-blue-400",
      percentage: Math.round((tooSlow / total) * 100),
    });

    return { zones: result, onTargetPct: Math.round((onTarget / total) * 100) };
  }, [wpmData, targetSps, isTherapist, wordTimestamps]);

  if (!zones) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Répartition du débit</span>
      </div>

      {/* The bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {zones.zones.map((z) => (
          <div
            key={z.key}
            className={`${z.color} transition-all duration-500`}
            style={{ width: `${Math.max(z.percentage, 2)}%` }}
            title={`${z.label} : ${z.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {zones.zones.map((z) => (
          <div key={z.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`w-2.5 h-2.5 rounded-full ${z.color}`} />
            <span>{z.label}</span>
            <span className="font-medium text-foreground">{z.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Summary line */}
      <p className="text-xs text-muted-foreground">
        {zones.onTargetPct >= 80
          ? `✅ ${zones.onTargetPct}% du temps dans la cible — excellent contrôle`
          : zones.onTargetPct >= 50
          ? `👍 ${zones.onTargetPct}% du temps dans la cible — vous progressez bien`
          : `💡 ${zones.onTargetPct}% du temps dans la cible — pensez à respirer entre les phrases`
        }
      </p>
    </div>
  );
};

export default SpeedComplianceBar;
