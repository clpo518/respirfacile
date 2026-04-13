import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, MessageSquare, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ClinicalWaveform from "@/components/clinical/ClinicalWaveform";

export interface RetellingAnalysis {
  keyPointResults: { keyPoint: string; found: boolean; comment: string }[];
  score: number;
  total: number;
  concision: "concis" | "acceptable" | "digressif";
  concisionComment: string;
  digressions: string[];
  organisation: "logique" | "partiellement logique" | "désorganisé";
  organisationComment: string;
  globalFeedback: string;
}

interface RetellingBilanProps {
  analysis: RetellingAnalysis | null;
  loading: boolean;
  error: string | null;
  audioUrl: string | null;
  onRetry: () => void;
  onBackToLibrary: () => void;
}

const concisionEmoji = { concis: "✅", acceptable: "🔶", digressif: "🔴" };
const concisionLabel = { concis: "Concis", acceptable: "Acceptable", digressif: "Digressif" };
const orgEmoji = { "logique": "✅", "partiellement logique": "🔶", "désorganisé": "🔴" };

const RetellingBilan = ({ analysis, loading, error, audioUrl, onRetry, onBackToLibrary }: RetellingBilanProps) => {
  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyse de votre restitution en cours...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 border-destructive/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const scorePercent = Math.round((analysis.score / analysis.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 space-y-4"
    >
      {/* Score Header */}
      <Card className="border-2 border-primary/30">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-1">
            {analysis.score}/{analysis.total}
          </div>
          <p className="text-sm text-muted-foreground">points clés restitués</p>
          <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Points Checklist */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>📋</span> Points clés
          </h3>
          {analysis.keyPointResults.map((kp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                kp.found
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              {kp.found ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{kp.keyPoint}</p>
                {kp.comment && (
                  <p className="text-xs text-muted-foreground mt-0.5">{kp.comment}</p>
                )}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Audio Playback */}
      {audioUrl && (
        <ClinicalWaveform audioUrl={audioUrl} />
      )}

      {/* Concision & Organisation */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Concision</p>
            <p className="text-lg font-bold">
              {concisionEmoji[analysis.concision]} {concisionLabel[analysis.concision]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{analysis.concisionComment}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Organisation</p>
            <p className="text-lg font-bold">
              {orgEmoji[analysis.organisation] || "🔶"} {analysis.organisation}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{analysis.organisationComment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Digressions */}
      {analysis.digressions.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Digressions détectées
            </h3>
            <ul className="space-y-1">
              {analysis.digressions.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span> {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Global Feedback */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">{analysis.globalFeedback}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Réessayer
        </Button>
        <Button onClick={onBackToLibrary} className="gap-2">
          Continuer <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default RetellingBilan;
