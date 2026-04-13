import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart, Bar } from "recharts";
import { TrendingDown, TrendingUp, Target, Calendar } from "lucide-react";
import { wpmToSps } from "@/lib/spsUtils";

interface Session {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
}

interface PatientEvolutionChartProps {
  sessions: Session[];
  patientName?: string;
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

const PatientEvolutionChart = ({ sessions, patientName, targetSps }: PatientEvolutionChartProps) => {
  const effectiveTarget = targetSps ?? 4.5;
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period]);

  if (filtered.length < 2) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historique & Progrès
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {filtered.length === 0 
              ? "Aucune session sur cette période"
              : "Au moins 2 sessions sont nécessaires pour voir l'évolution"}
          </CardDescription>
          {/* Period filter even in empty state */}
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
      </Card>
    );
  }

  // Prepare chart data (oldest first) - converted to SPS
  const chartData = [...filtered].reverse().map((s, i) => ({
    session: i + 1,
    date: new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    avg: wpmToSps(s.avg_wpm),
    max: wpmToSps(s.max_wpm),
    duration: Math.round(s.duration_seconds / 60),
  }));

  // Calculate trend (in SPS)
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.reduce((acc, s) => acc + s.avg, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, s) => acc + s.avg, 0) / secondHalf.length;
  const improvement = Math.round((firstAvg - secondAvg) * 10) / 10;
  const isImproving = improvement > 0.3;
  const isRegressing = improvement < -0.3;

  // Calculate stats (in SPS)
  const overallAvg = Math.round(chartData.reduce((acc, s) => acc + s.avg, 0) / chartData.length * 10) / 10;
  const sessionsInTarget = chartData.filter(s => s.avg <= effectiveTarget).length;
  const targetPercentage = Math.round((sessionsInTarget / chartData.length) * 100);

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Historique & Progrès
              {patientName && <span className="text-muted-foreground font-normal">• {patientName}</span>}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Évolution sur {chartData.length} sessions
            </CardDescription>
            {/* Period filter */}
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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isImproving ? "bg-green-100 text-green-700" :
            isRegressing ? "bg-red-100 text-red-700" :
            "bg-muted text-muted-foreground"
          }`}>
            {isImproving ? <TrendingDown className="w-4 h-4" /> :
             isRegressing ? <TrendingUp className="w-4 h-4" /> :
             <Target className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isImproving ? `−${improvement} syll/sec` :
               isRegressing ? `+${Math.abs(improvement)} syll/sec` :
               "Stable"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
            <div className="text-2xl font-mono font-bold text-foreground">{overallAvg}</div>
            <div className="text-xs text-muted-foreground">syll/sec moy.</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
            <div className="text-2xl font-mono font-bold text-primary">{targetPercentage}%</div>
            <div className="text-xs text-muted-foreground">dans la cible</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
            <div className="text-2xl font-mono font-bold text-primary">{targetPercentage}%</div>
            <div className="text-xs text-muted-foreground">≤ {effectiveTarget} syll/sec</div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-64 bg-muted/30 rounded-lg p-4 border border-border">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[2, 8]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    avg: "Moyenne",
                    max: "Maximum",
                  };
                  return [`${value} syll/sec`, labels[name] || name];
                }}
              />
              
              {/* Target Zone */}
              <ReferenceLine 
                y={effectiveTarget} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: `Cible (${effectiveTarget})`, 
                  position: "right", 
                  fontSize: 10,
                  fill: "#10b981",
                }}
              />
              
              {/* Danger Zone - 6 SPS */}
              <ReferenceLine 
                y={6} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{ 
                  value: "Limite haute", 
                  position: "right", 
                  fontSize: 9,
                  fill: "#ef4444",
                }}
              />
              
              {/* Area under curve */}
              <Area 
                type="monotone" 
                dataKey="avg" 
                stroke="transparent"
                fill="url(#colorAvg)"
              />
              
              {/* Average line */}
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#10b981"
                strokeWidth={3}
                name="avg"
                dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
              
              {/* Max line */}
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                name="max"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Vitesse moyenne</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500" style={{ width: 12 }} />
            <span className="text-muted-foreground">Vitesse max</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" style={{ width: 12 }} />
            <span className="text-muted-foreground">Cible ({effectiveTarget})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientEvolutionChart;
