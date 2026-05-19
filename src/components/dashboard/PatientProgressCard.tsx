import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Target, BarChart3, Zap, CheckCircle2 } from "lucide-react";
import { 
  XAxis, YAxis, ResponsiveContainer, Area, ComposedChart, 
  Line, ReferenceLine, Tooltip, CartesianGrid 
} from "recharts";
import { motion } from "framer-motion";
import { wpmToSps } from "@/lib/spsUtils";

interface Session {
  created_at: string;
  avg_wpm: number;
  max_wpm: number;
}

interface PatientProgressCardProps {
  sessions: Session[];
  targetSps?: number;
}

type PeriodFilter = "7d" | "30d" | "3m" | "all";
const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "7d", label: "7j" },
  { value: "30d", label: "30j" },
  { value: "3m", label: "3 mois" },
  { value: "all", label: "Tout" },
];

function filterByPeriod(sessions: Session[], period: PeriodFilter): Session[] {
  if (period === "all") return sessions;
  const now = new Date();
  const cutoff = new Date();
  if (period === "7d") cutoff.setDate(now.getDate() - 7);
  else if (period === "30d") cutoff.setDate(now.getDate() - 30);
  else cutoff.setMonth(now.getMonth() - 3);
  return sessions.filter(s => new Date(s.created_at) >= cutoff);
}

const PatientProgressCard = ({ sessions, targetSps }: PatientProgressCardProps) => {
  const effectiveTarget = targetSps ?? 4.5;
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period]);

  // Not enough data state
  if (filtered.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Vos progrès
          </CardTitle>
          <CardDescription>
            {filtered.length === 0 
              ? "Aucune session sur cette période"
              : "Encore une séance pour débloquer votre courbe d'évolution !"}
          </CardDescription>
          <div className="flex gap-1 pt-2">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  period === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-sm">
              📊 Votre courbe de progression apparaîtra ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (oldest first) - converted to SPS
  const chartData = [...filtered].reverse().map((s) => ({
    date: new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    avg: Math.round(wpmToSps(s.avg_wpm) * 10) / 10,
  }));

  // Calculate trend (first half vs second half)
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.reduce((acc, s) => acc + s.avg, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, s) => acc + s.avg, 0) / secondHalf.length;
  const improvement = Math.round((firstAvg - secondAvg) * 10) / 10;
  const isImproving = improvement > 0.3;
  const isRegressing = improvement < -0.3;

  // Stats
  const overallAvg = Math.round(chartData.reduce((acc, s) => acc + s.avg, 0) / chartData.length * 10) / 10;
  const sessionsInTarget = chartData.filter(s => s.avg <= effectiveTarget).length;
  const targetPercentage = Math.round((sessionsInTarget / chartData.length) * 100);

  // Dynamic Y domain
  const allValues = chartData.map(d => d.avg);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const yMin = Math.max(0, Math.floor(minVal - 1));
  const yMax = Math.max(Math.ceil(maxVal + 1), Math.ceil(effectiveTarget + 1.5));

  // Smart X-axis tick interval to avoid clutter
  const tickInterval = chartData.length > 20 ? Math.ceil(chartData.length / 10) - 1 : 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Vos progrès
            </CardTitle>
            <CardDescription>
              Évolution sur {chartData.length} séances
            </CardDescription>
            <div className="flex gap-1 pt-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    period === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Trend Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isImproving ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              isRegressing ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              "bg-muted text-muted-foreground"
            }`}
          >
            {isImproving ? <TrendingDown className="w-4 h-4" /> :
             isRegressing ? <TrendingUp className="w-4 h-4" /> :
             <Target className="w-4 h-4" />}
            <span>
              {isImproving ? `−${improvement} pts` :
               isRegressing ? `+${Math.abs(improvement)} pts` :
               "Stable"}
            </span>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats Summary - 2 KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-xl p-4 text-center"
          >
            <Zap className="w-4 h-4 text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-foreground">
              {overallAvg}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">pts moy.</div>
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 rounded-xl p-4 text-center"
          >
            <CheckCircle2 className="w-4 h-4 text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-foreground">
              {targetPercentage}%
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">≤ {effectiveTarget} pts</div>
          </motion.div>
        </div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-56 rounded-xl bg-muted/20 border border-border/50 p-3 pt-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="patientProgressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
                angle={chartData.length > 15 ? -35 : 0}
                textAnchor={chartData.length > 15 ? "end" : "middle"}
                height={chartData.length > 15 ? 45 : 30}
              />
              <YAxis 
                domain={[yMin, yMax]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  color: "hsl(var(--foreground))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                formatter={(value: number) => [`${value} pts`, "Score moyen"]}
              />
              
              {/* Target line */}
              <ReferenceLine 
                y={effectiveTarget} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="6 4"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
              
              {/* Area under curve */}
              <Area 
                type="monotone" 
                dataKey="avg" 
                stroke="transparent"
                fill="url(#patientProgressGradient)"
              />
              
              {/* Average line only — no max line */}
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: chartData.length > 30 ? 2 : 3.5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Simplified legend */}
        <div className="flex items-center justify-center gap-5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Score moyen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-[2px] border-t-[2px] border-dashed border-primary opacity-70" />
            <span className="text-muted-foreground">Cible ({effectiveTarget})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientProgressCard;
