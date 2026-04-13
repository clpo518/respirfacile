import { useMemo } from "react";
import { motion } from "framer-motion";
import { analyzeClutteringProfile } from "@/lib/clutteringProfile";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";
import { getAgeGroup } from "@/lib/ageNormsUtils";

interface ClutteringCardProps {
  wordTimestamps?: WordTimestamp[] | null;
  targetSps: number;
  /** Show clinical detail (for therapists) vs simplified (for patients) */
  isTherapist?: boolean;
  delay?: number;
  /** Patient birth year for age-norm context */
  birthYear?: number | null;
}

const ClutteringCard = ({ wordTimestamps, targetSps, isTherapist = false, delay = 0.3, birthYear }: ClutteringCardProps) => {
  const profile = useMemo(
    () => analyzeClutteringProfile(wordTimestamps ?? undefined, targetSps),
    [wordTimestamps, targetSps],
  );

  const ageNorm = useMemo(() => getAgeGroup(birthYear ?? null), [birthYear]);

  // Hide for patients if severity is mild or none
  if (!profile || profile.severity === "none") return null;
  if (!isTherapist && profile.severity === "mild") return null;

  const borderClass =
    profile.severity === "severe"
      ? "border-destructive/30 bg-destructive/5"
      : profile.severity === "moderate"
      ? "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10"
      : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10";

  const emoji =
    profile.severity === "severe" ? "🔴" : profile.severity === "moderate" ? "🟠" : "🟡";

  const title = isTherapist
    ? `Bredouillement ${profile.severity === "mild" ? "léger" : profile.severity === "moderate" ? "modéré" : "sévère"} — ${profile.severityScore10}/10`
    : profile.severity === "moderate"
    ? "Rythme à travailler"
    : "Rythme à surveiller";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className={`rounded-xl border p-4 space-y-3 ${borderClass}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5">{emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isTherapist ? profile.clinicalSummary : profile.patientSummary}
          </p>
        </div>
      </div>

      {/* Detailed stats for therapists — fully in French */}
      {isTherapist && (
        <div className="grid grid-cols-2 gap-2">
          {profile.burstCount > 0 && (
            <div className="rounded-lg bg-background/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{profile.burstCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accélérations</p>
              <p className="text-[10px] text-muted-foreground">{profile.burstPercentage}% du temps</p>
            </div>
          )}
          {profile.averageGap !== null && (
            <div className="rounded-lg bg-background/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{Math.round(profile.averageGap * 1000)}<span className="text-xs font-normal">ms</span></p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pauses inter-mots</p>
              {profile.pauseDeficit && (
                <p className="text-[10px] text-destructive font-medium">Déficit</p>
              )}
            </div>
          )}
          {profile.rateCV !== null && (
            <div className="rounded-lg bg-background/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{profile.rateCV}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Variabilité débit</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {profile.rateVariability === "stable" ? "Stable" : profile.rateVariability === "variable" ? "Variable" : "Irrégulier"}
              </p>
            </div>
          )}
          {profile.telescopingDetected && (
            <div className="rounded-lg bg-background/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">+{profile.averageCompressionBoost}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Télescopage</p>
              <p className="text-[10px] text-muted-foreground">syll/sec</p>
            </div>
          )}
          {profile.normalDisfluencyRate !== null && profile.excessiveDisfluencies && (
            <div className="rounded-lg bg-background/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{profile.normalDisfluencyRate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Disfluences normales</p>
              <p className="text-[10px] text-destructive font-medium">Excessif</p>
            </div>
          )}
          {/* Age norm context for therapists */}
          <div className="rounded-lg bg-background/50 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{ageNorm.normSPS}<span className="text-xs font-normal"> syll/s</span></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Norme {ageNorm.label}</p>
            <p className="text-[10px] text-muted-foreground">Cible : {targetSps} syll/s</p>
          </div>
        </div>
      )}
      {/* Simplified stats for patients */}
      {!isTherapist && (
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {profile.burstCount > 0 && (
            <span>⚡ {profile.burstPercentage}% en accélération</span>
          )}
          {profile.averageGap !== null && (
            <span>⏱️ {Math.round(profile.averageGap * 1000)}ms entre mots</span>
          )}
          {profile.excessiveDisfluencies && (
            <span>🔄 Reprises fréquentes</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ClutteringCard;
