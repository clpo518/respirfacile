import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, Users, Stethoscope, UserCheck, Activity, BarChart3,
  Clock, Gauge, Mic, CreditCard, XCircle, AlertTriangle, User, UserPlus, DollarSign,
  Mail, Copy, TrendingUp, Euro, Zap, Target, Heart, ArrowDown, Shield, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────
interface UserEntry { id: string; name: string; email: string; plan: string; isTherapist: boolean; stripeCustomerId?: string | null; patientCount?: number; patientSessions?: number; mrr?: number; createdAt?: string }
interface TrialEntry { id: string; name: string; isTherapist: boolean; daysLeft: number; endDate: string }
interface DeepgramExerciseCost { type: string; minutes: number; cost: number; sessions: number }
interface DeepgramStats { totalMinutes: number; costTotal: number; costThisWeek: number; costThisMonth: number; avgPerSession: number; byExercise: DeepgramExerciseCost[]; ratePerMin: number }
interface RevenueBreakdownEntry { plan: string; count: number; mrr: number }
interface RevenueStats { mrr: number; arr: number; activeSubscribers: number; revenueBreakdown: RevenueBreakdownEntry[]; churnedCount: number; planPrices: Record<string, number> }
interface TherapistPatientEntry { id: string; name: string; patientCount: number; patients: { id: string; name: string }[]; subscriptionStatus: string; plan: string }
interface HotLead { id: string; name: string; email: string; patientCount: number; patientSessions: number; daysLeft: number | null; score: number; signal: string }
interface ChurnRisk { id: string; name: string; email: string; plan: string; patientCount: number; patientSessions: number; daysSinceActivity: number | null; riskScore: number; riskLevel: string }
interface ConversionSignals { hotLeads: HotLead[]; churnRisks: ChurnRisk[] }
interface FunnelStep { step: string; count: number }
interface RetentionCohort { week: string; signups: number; d7: number; d14: number; d30: number }
interface AbandonmentPage { path: string; views: number; actions: number; engagementPct: number }
interface AdvancedInsights { avgTimeToFirstSessionHours: number | null; medianTimeToFirstSessionHours: number | null; neverSessioned: number; neverSessionedPct: number; peakHour: { hour: number; sessions: number } | null; abandonmentPages: AbandonmentPage[] }
interface AnalyticsStats { totalEvents: number; topEvents: { name: string; count: number }[]; topPages: { path: string; count: number }[]; dailyEvents: { day: string; count: number }[]; funnelSteps: { name: string; count: number }[]; conversionFunnel: FunnelStep[]; retentionCohorts: RetentionCohort[]; advancedInsights: AdvancedInsights }
interface SaasKpis { trialToPaidRate: number; activationRate: number; arpu: number; avgPatientsPerPayingTherapist: number; weeklyActiveRate: number; activatedCount: number }
interface UnpaidTherapistEntry { id: string; name: string; email: string; plan: string; subscriptionStatus: string; trialExpired: boolean; trialEndDate: string | null; createdAt: string; patientCount: number }
interface Recommendation { type: "opportunity" | "alert" | "insight"; icon: string; title: string; description: string; priority: number }

// New types
interface MrrMovements { existing: number; new: number; churned: number; net: number }
interface HealthScoreEntry { id: string; name: string; email: string; plan: string; subscriptionStatus: string; score: number; level: string; patientCount: number; recentPatientSessions: number; totalPatientSessions: number; daysSinceActivity: number | null; trend: number }
interface FeatureAdoptionEntry { exercise: string; retainedUsers: number; inactiveUsers: number; retainedSessions: number; inactiveSessions: number; retentionCorrelation: number; inactiveCorrelation: number }
interface TimeToValueSide { avgHours: number | null; medianHours: number | null; reachedCount: number; totalCount: number }
interface TimeToValueData { therapist: TimeToValueSide; patient: TimeToValueSide }
interface LifecycleStats { avgEngagement: number; stageBreakdown: Record<string, number>; topPowerUsers: { id: string; name: string; isTherapist: boolean; engagement: number; stage: string; totalSessions: number; recentSessions: number }[]; dormantUsers: number; coolingUsers: number; churnedUsers: number }

interface AdminStats {
  totalUsers: number; therapists: number; patients: number; linkedPatients: number;
  activeCount: number; totalSessions: number; avgDuration: number; avgWpm: number; recordingRate: number;
  weeklySignups: { week: string; count: number }[]; dailySessions: { day: string; count: number }[];
  exerciseBreakdown: { name: string; value: number }[]; subscriptionBreakdown: { status: string; count: number }[];
  payingUsers: UserEntry[]; canceledUsers: UserEntry[]; expiringTrials: TrialEntry[];
  totalTrials: number; newTherapistsThisWeek: number; newPatientsThisWeek: number;
  deepgramStats: DeepgramStats; therapistPatientMap: TherapistPatientEntry[];
  unpaidTherapistList: UnpaidTherapistEntry[];
  revenueStats?: RevenueStats; conversionSignals?: ConversionSignals;
  analyticsStats?: AnalyticsStats; saasKpis?: SaasKpis;
  recommendations?: Recommendation[];
  rangeDays?: number;
  // New
  mrrMovements?: MrrMovements;
  healthScores?: HealthScoreEntry[];
  featureAdoption?: FeatureAdoptionEntry[];
  timeToValue?: TimeToValueData;
  lifecycleStats?: LifecycleStats;
}

const TIME_RANGES = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "1 an", days: 365 },
] as const;

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#f59e0b", "#ef4444", "#8b5cf6"];

const EXERCISE_LABELS: Record<string, string> = {
  reading: "Lecture", improvisation: "Improvisation", warmup: "Échauffement",
  repetition: "Répétition", dialogue: "Dialogue",
};
const SUB_LABELS: Record<string, string> = {
  none: "Aucun", active: "Actif", canceled: "Annulé", trial: "Essai", refunded: "Remboursé",
};
const PLAN_LABELS: Record<string, string> = {
  starter_3: "Essentiel", essentiel: "Essentiel", pro_5: "Expert", expert: "Expert",
  premium_10: "Premium", premium: "Premium", monthly: "Mensuel B2C",
  yearly: "Annuel B2C", trial: "Essai",
};
const STAGE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  new: { label: "Nouveaux", emoji: "🆕", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  active: { label: "Actifs", emoji: "✅", color: "bg-primary/10 text-primary" },
  power_user: { label: "Power Users", emoji: "⚡", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  cooling: { label: "En refroidissement", emoji: "🌡️", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  dormant: { label: "Dormants", emoji: "💤", color: "bg-muted text-muted-foreground" },
  churned: { label: "Perdus", emoji: "👋", color: "bg-destructive/10 text-destructive" },
};

function wpmToSps(wpm: number): string { return (wpm / 60 * 2.2).toFixed(1); }
function formatHours(h: number | null): string {
  if (h === null) return "—";
  if (h < 1) return `${Math.round(h * 60)}min`;
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}j`;
}

// ─── Reusable Components ─────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="space-y-1 pb-2">
    <h2 className="text-lg font-semibold flex items-center gap-2">{icon} {title}</h2>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

const KpiCard = ({ title, value, icon: Icon, suffix, hint }: { title: string; value: string | number; icon: React.ElementType; suffix?: string; hint?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}{suffix}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const BigKpiCard = ({ title, value, subtitle, borderClass }: { title: string; value: string; subtitle?: string; borderClass?: string }) => (
  <Card className={borderClass}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

const RoleBadge = ({ isTherapist }: { isTherapist: boolean }) => (
  <Badge variant={isTherapist ? "default" : "secondary"} className="text-xs">
    {isTherapist ? "Ortho" : "Patient"}
  </Badge>
);

const CopyEmailsButton = ({ emails }: { emails: string[] }) => (
  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(emails.filter((e) => e !== "—").join(", "))}>
    <Copy className="h-3.5 w-3.5 mr-1" /> Copier emails
  </Button>
);

const HealthBadge = ({ level }: { level: string }) => {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    excellent: { label: "🟢 Excellent", variant: "default" },
    bon: { label: "🔵 Bon", variant: "secondary" },
    attention: { label: "🟡 Attention", variant: "outline" },
    critique: { label: "🔴 Critique", variant: "destructive" },
  };
  const c = config[level] || config.attention;
  return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
};

// ─── Main Component ──────────────────────────────────────────
export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState(30);

  const fetchStats = useCallback(async (days?: number) => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("admin-stats", {
      body: { rangeDays: days ?? rangeDays },
    });
    if (fnError) {
      setError(fnError.message?.includes("non-2xx") ? "Accès refusé. Vérifiez que votre compte est autorisé." : fnError.message);
      setLoading(false);
      return;
    }
    if (data?.error) { setError(data.error); setLoading(false); return; }
    setStats(data as AdminStats);
    setLoading(false);
  }, [rangeDays]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRangeChange = (days: number) => { setRangeDays(days); fetchStats(days); };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button className="mt-4" onClick={() => fetchStats()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ════════ HEADER ════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Cockpit PMV</h1>
              <p className="text-sm text-muted-foreground">Pilotage temps réel de ton activité</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Période :</span>
            {TIME_RANGES.map((r) => (
              <Button key={r.days} variant={rangeDays === r.days ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => handleRangeChange(r.days)} disabled={loading}>
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : stats ? (
          <>
            {/* ════════ 0. RECOMMENDATIONS ════════ */}
            {stats.recommendations && stats.recommendations.length > 0 && (
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> À faire maintenant
                  </CardTitle>
                  <CardDescription>Actions prioritaires générées automatiquement à partir de tes données.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recommendations.map((rec, i) => (
                      <div key={i} className={`flex gap-3 p-3 rounded-lg border ${rec.type === "alert" ? "border-destructive/30 bg-destructive/5" : rec.type === "opportunity" ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/30"}`}>
                        <span className="text-xl shrink-0">{rec.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                        </div>
                        <Badge variant={rec.type === "alert" ? "destructive" : rec.type === "opportunity" ? "secondary" : "outline"} className="shrink-0 self-start text-xs">
                          {rec.type === "alert" ? "Urgent" : rec.type === "opportunity" ? "Opportunité" : "Conseil"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ════════ 1. NORTH STAR — Revenus & MRR Movements ════════ */}
            <div className="space-y-4">
              <SectionHeader icon={<Euro className="h-5 w-5" />} title="💰 Santé Business" subtitle="Les chiffres qui comptent pour piloter ta croissance et ton revenu." />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BigKpiCard title="MRR (Revenu Mensuel Récurrent)" value={`${stats.revenueStats?.mrr.toFixed(2) ?? "0"}€`} subtitle={`ARR projeté : ${stats.revenueStats?.arr.toFixed(0) ?? "0"}€/an`} borderClass="border-primary/30 bg-primary/5" />
                <BigKpiCard title="Conversion Essai → Payant" value={`${stats.saasKpis?.trialToPaidRate ?? 0}%`} subtitle={`${stats.revenueStats?.activeSubscribers ?? 0} payants sur ${stats.therapists} orthos`} borderClass={`${(stats.saasKpis?.trialToPaidRate ?? 0) >= 15 ? "border-primary/30" : "border-destructive/30"}`} />
                <BigKpiCard title="Taux d'activation (7j)" value={`${stats.saasKpis?.activationRate ?? 0}%`} subtitle={`${stats.saasKpis?.activatedCount ?? 0} ont fait ≥1 session en 7j`} borderClass={`${(stats.saasKpis?.activationRate ?? 0) >= 40 ? "border-primary/30" : "border-destructive/30"}`} />
                <BigKpiCard title="ARPU" value={`${stats.saasKpis?.arpu ?? 0}€/mois`} subtitle={`Moy. ${stats.saasKpis?.avgPatientsPerPayingTherapist ?? 0} patients/ortho payant`} />
              </div>

              {/* MRR Movements */}
              {stats.mrrMovements && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Mouvements de MRR
                    </CardTitle>
                    <CardDescription>
                      Ce que gagnent les SaaS qui scalent : décomposer le revenu en flux entrants et sortants, pas juste un total.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">MRR existant</p>
                        <p className="text-xl font-bold">{stats.mrrMovements.existing.toFixed(0)}€</p>
                        <p className="text-xs text-muted-foreground">Clients d'avant la période</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">📈 Nouveau MRR</p>
                        <p className="text-xl font-bold text-primary">+{stats.mrrMovements.new.toFixed(0)}€</p>
                        <p className="text-xs text-muted-foreground">Nouvelles conversions</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-destructive/10">
                        <p className="text-xs text-muted-foreground mb-1">📉 MRR perdu (churn)</p>
                        <p className="text-xl font-bold text-destructive">-{stats.mrrMovements.churned.toFixed(0)}€</p>
                        <p className="text-xs text-muted-foreground">Résiliations</p>
                      </div>
                      <div className={`text-center p-3 rounded-lg ${stats.mrrMovements.net >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                        <p className="text-xs text-muted-foreground mb-1">🏁 MRR net</p>
                        <p className={`text-xl font-bold ${stats.mrrMovements.net >= 0 ? "text-primary" : "text-destructive"}`}>
                          {stats.mrrMovements.net >= 0 ? "+" : ""}{stats.mrrMovements.net.toFixed(0)}€
                        </p>
                        <p className="text-xs text-muted-foreground">Nouveau − Churn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Revenue breakdown */}
              {stats.revenueStats && stats.revenueStats.revenueBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Décomposition MRR par formule</CardTitle>
                    <CardDescription>Quel plan rapporte le plus ? Où concentrer les efforts d'upsell.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.revenueStats.revenueBreakdown.map((entry, i) => {
                        const maxMrr = stats.revenueStats!.revenueBreakdown[0]?.mrr || 1;
                        const pct = maxMrr > 0 ? Math.round((entry.mrr / maxMrr) * 100) : 0;
                        return (
                          <div key={entry.plan} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{PLAN_LABELS[entry.plan] || entry.plan}</span>
                              <span className="text-muted-foreground">{entry.mrr.toFixed(2)}€/mois · {entry.count} abonné{entry.count > 1 ? "s" : ""}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ════════ 2. HEALTH SCORES ════════ */}
            {stats.healthScores && stats.healthScores.length > 0 && (
              <div className="space-y-4">
                <SectionHeader icon={<Shield className="h-5 w-5" />} title="🏥 Health Score par ortho" subtitle="Score composite (0-100) combinant : patients, activité récente, récence, tendance. Le thermomètre de chaque client." />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-primary">{stats.healthScores.filter((h) => h.level === "excellent").length}</p>
                      <p className="text-xs text-muted-foreground mt-1">🟢 Excellent (≥70)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold">{stats.healthScores.filter((h) => h.level === "bon").length}</p>
                      <p className="text-xs text-muted-foreground mt-1">🔵 Bon (50-69)</p>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/20">
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-amber-600">{stats.healthScores.filter((h) => h.level === "attention").length}</p>
                      <p className="text-xs text-muted-foreground mt-1">🟡 Attention (30-49)</p>
                    </CardContent>
                  </Card>
                  <Card className="border-destructive/20">
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-destructive">{stats.healthScores.filter((h) => h.level === "critique").length}</p>
                      <p className="text-xs text-muted-foreground mt-1">🔴 Critique (&lt;30)</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Classement santé client</CardTitle>
                    <CardDescription>En un coup d'œil : qui va churner et qui est fan. Le score intègre le nb de patients, les sessions récentes, la récence et la tendance.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-2 font-medium text-muted-foreground">Score</th>
                            <th className="pb-2 font-medium text-muted-foreground">Niveau</th>
                            <th className="pb-2 font-medium text-muted-foreground">Nom</th>
                            <th className="pb-2 font-medium text-muted-foreground">Plan</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Patients</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Sessions (14j)</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Tendance</th>
                            <th className="pb-2 font-medium text-muted-foreground">Dernière activité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.healthScores.slice(0, 20).map((h) => (
                            <tr key={h.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${h.score}%`, backgroundColor: h.score >= 70 ? "hsl(var(--primary))" : h.score >= 50 ? "#3b82f6" : h.score >= 30 ? "#f59e0b" : "hsl(var(--destructive))" }} />
                                  </div>
                                  <span className="font-bold tabular-nums text-xs">{h.score}</span>
                                </div>
                              </td>
                              <td className="py-2"><HealthBadge level={h.level} /></td>
                              <td className="py-2 font-medium">{h.name}</td>
                              <td className="py-2"><Badge variant="outline" className="text-xs">{PLAN_LABELS[h.plan] || h.plan}</Badge></td>
                              <td className="py-2 text-center">{h.patientCount}</td>
                              <td className="py-2 text-center font-medium">{h.recentPatientSessions}</td>
                              <td className="py-2 text-center">
                                <span className={`text-xs font-medium ${h.trend > 0 ? "text-primary" : h.trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {h.trend > 0 ? `↑${h.trend}%` : h.trend < 0 ? `↓${Math.abs(h.trend)}%` : "→"}
                                </span>
                              </td>
                              <td className="py-2 text-xs text-muted-foreground">
                                {h.daysSinceActivity !== null ? (h.daysSinceActivity === 0 ? "Aujourd'hui" : `il y a ${h.daysSinceActivity}j`) : "Jamais"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ════════ 3. TIME TO VALUE ════════ */}
            {stats.timeToValue && (
              <div className="space-y-4">
                <SectionHeader icon={<Clock className="h-5 w-5" />} title="⏱️ Time-to-Value" subtitle="Combien de temps entre l'inscription et le 'Magic Moment' ? C'est TON levier n°1 pour la rétention." />

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">🩺 Ortho → 1er patient actif</CardTitle>
                      <CardDescription>Temps entre l'inscription de l'ortho et la 1ère session d'un de ses patients. C'est le "Magic Moment" B2B.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-3xl font-bold">{formatHours(stats.timeToValue.therapist.medianHours)}</p>
                          <p className="text-xs text-muted-foreground">Médiane</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold">{formatHours(stats.timeToValue.therapist.avgHours)}</p>
                          <p className="text-xs text-muted-foreground">Moyenne</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {stats.timeToValue.therapist.reachedCount}/{stats.timeToValue.therapist.totalCount} orthos ont atteint ce moment
                        ({stats.timeToValue.therapist.totalCount > 0 ? Math.round((stats.timeToValue.therapist.reachedCount / stats.timeToValue.therapist.totalCount) * 100) : 0}%)
                      </p>
                      {stats.timeToValue.therapist.medianHours !== null && stats.timeToValue.therapist.medianHours > 48 && (
                        <p className="text-xs text-amber-600 mt-1">⚠️ Objectif &lt; 48h. Réduis ce délai avec un onboarding plus guidé.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">🎯 Patient → 1ère session</CardTitle>
                      <CardDescription>Temps entre l'inscription du patient et sa 1ère session d'entraînement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-3xl font-bold">{formatHours(stats.timeToValue.patient.medianHours)}</p>
                          <p className="text-xs text-muted-foreground">Médiane</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold">{formatHours(stats.timeToValue.patient.avgHours)}</p>
                          <p className="text-xs text-muted-foreground">Moyenne</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {stats.timeToValue.patient.reachedCount}/{stats.timeToValue.patient.totalCount} patients ont fait ≥1 session
                        ({stats.timeToValue.patient.totalCount > 0 ? Math.round((stats.timeToValue.patient.reachedCount / stats.timeToValue.patient.totalCount) * 100) : 0}%)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ════════ 4. PIPELINE SALES ════════ */}
            {stats.conversionSignals && (
              <div className="space-y-4">
                <SectionHeader icon={<Target className="h-5 w-5" />} title="🎯 Pipeline Sales" subtitle="Qui contacter aujourd'hui pour maximiser les conversions." />

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Cette semaine :</span>
                      <Badge variant="default">{stats.newTherapistsThisWeek ?? 0} nouv. ortho{(stats.newTherapistsThisWeek ?? 0) > 1 ? "s" : ""}</Badge>
                      <Badge variant="secondary">{stats.newPatientsThisWeek ?? 0} nouv. patient{(stats.newPatientsThisWeek ?? 0) > 1 ? "s" : ""}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {stats.conversionSignals.hotLeads.length > 0 && (
                  <Card className="border-amber-500/20">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                      <span className="text-xl">🔥</span>
                      <div className="flex-1">
                        <CardTitle className="text-base">Orthos prêtes à convertir</CardTitle>
                        <CardDescription>En essai, avec des patients actifs.</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto">{stats.conversionSignals.hotLeads.length}</Badge>
                      <CopyEmailsButton emails={stats.conversionSignals.hotLeads.map((l) => l.email)} />
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b text-left">
                            <th className="pb-2 font-medium text-muted-foreground">Priorité</th>
                            <th className="pb-2 font-medium text-muted-foreground">Nom</th>
                            <th className="pb-2 font-medium text-muted-foreground">Email</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Patients</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Sessions (14j)</th>
                            <th className="pb-2 font-medium text-muted-foreground">Fin d'essai</th>
                          </tr></thead>
                          <tbody>
                            {stats.conversionSignals.hotLeads.map((l) => (
                              <tr key={l.id} className="border-b border-border/50 hover:bg-muted/50">
                                <td className="py-2">{l.signal}</td>
                                <td className="py-2 font-medium">{l.name}</td>
                                <td className="py-2 text-muted-foreground text-xs">{l.email}</td>
                                <td className="py-2 text-center">{l.patientCount}</td>
                                <td className="py-2 text-center font-medium">{l.patientSessions}</td>
                                <td className="py-2">{l.daysLeft !== null ? <Badge variant={l.daysLeft <= 3 ? "destructive" : l.daysLeft <= 7 ? "secondary" : "outline"} className="text-xs">{l.daysLeft}j</Badge> : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(stats.expiringTrials ?? []).length > 0 && (
                  <Card className="border-amber-500/20">
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div className="flex-1"><CardTitle className="text-base">Essais expirant sous 7 jours</CardTitle></div>
                      <Badge variant="outline">{(stats.expiringTrials ?? []).length}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(stats.expiringTrials ?? []).map((t) => (
                          <div key={t.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{t.name}</span>
                              <RoleBadge isTherapist={t.isTherapist} />
                            </div>
                            <Badge variant={t.daysLeft <= 2 ? "destructive" : "secondary"} className="text-xs">{t.daysLeft}j</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ════════ 5. CSM — Churn risks ════════ */}
            <div className="space-y-4">
              <SectionHeader icon={<Heart className="h-5 w-5" />} title="❤️ Customer Success" subtitle="Santé de tes clients payants et prévention des résiliations." />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Payants actifs" value={(stats.payingUsers ?? []).length} icon={CreditCard} hint="Abonnement actif" />
                <KpiCard title="Annulés" value={(stats.canceledUsers ?? []).length} icon={XCircle} />
                <KpiCard title="En essai" value={stats.totalTrials ?? 0} icon={Clock} />
                <KpiCard title="Actifs (7j)" value={`${stats.saasKpis?.weeklyActiveRate ?? 0}%`} icon={Activity} hint={`${stats.activeCount}/${stats.totalUsers}`} />
              </div>

              {stats.conversionSignals && stats.conversionSignals.churnRisks.length > 0 && (
                <Card className="border-destructive/20">
                  <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <span className="text-xl">⚠️</span>
                    <div className="flex-1"><CardTitle className="text-base">Risques de churn</CardTitle><CardDescription>Orthos payantes inactives. Un appel peut sauver l'abo.</CardDescription></div>
                    <CopyEmailsButton emails={stats.conversionSignals.churnRisks.map((r) => r.email)} />
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left">
                          <th className="pb-2 font-medium text-muted-foreground">Niveau</th>
                          <th className="pb-2 font-medium text-muted-foreground">Nom</th>
                          <th className="pb-2 font-medium text-muted-foreground">Email</th>
                          <th className="pb-2 font-medium text-muted-foreground">Plan</th>
                          <th className="pb-2 font-medium text-muted-foreground text-center">Patients</th>
                          <th className="pb-2 font-medium text-muted-foreground text-center">Sessions (14j)</th>
                          <th className="pb-2 font-medium text-muted-foreground">Dernière activité</th>
                        </tr></thead>
                        <tbody>
                          {stats.conversionSignals.churnRisks.map((r) => (
                            <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-2">{r.riskLevel}</td>
                              <td className="py-2 font-medium">{r.name}</td>
                              <td className="py-2 text-muted-foreground text-xs">{r.email}</td>
                              <td className="py-2"><Badge variant="outline" className="text-xs">{PLAN_LABELS[r.plan] || r.plan}</Badge></td>
                              <td className="py-2 text-center">{r.patientCount}</td>
                              <td className="py-2 text-center">{r.patientSessions}</td>
                              <td className="py-2">{r.daysSinceActivity !== null ? <span className={r.daysSinceActivity > 14 ? "text-destructive font-medium" : ""}>{r.daysSinceActivity}j</span> : <span className="text-destructive">Jamais</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Tableau détaillé des comptes payants ── */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Comptes payants</CardTitle>
                  <Badge variant="outline" className="ml-auto">{(stats.payingUsers ?? []).length}</Badge>
                  <CopyEmailsButton emails={(stats.payingUsers ?? []).map((u) => u.email)} />
                </CardHeader>
                <CardContent>
                  {(stats.payingUsers ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun abonné payant pour le moment.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead className="text-right">MRR</TableHead>
                          <TableHead className="text-right">Patients</TableHead>
                          <TableHead className="text-right">Sessions patients</TableHead>
                          <TableHead>Stripe</TableHead>
                          <TableHead>Inscrit le</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(stats.payingUsers ?? []).map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {u.name}
                                <RoleBadge isTherapist={u.isTherapist} />
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{PLAN_LABELS[u.plan] || u.plan}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{(u.mrr ?? 0).toFixed(2)}€</TableCell>
                            <TableCell className="text-right">{u.patientCount ?? 0}</TableCell>
                            <TableCell className="text-right">{u.patientSessions ?? 0}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {u.stripeCustomerId ? (
                                <a href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                                  {u.stripeCustomerId.slice(0, 12)}…
                                </a>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* ── Résiliations + Répartition ── */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-base">Résiliations</CardTitle>
                    <Badge variant="outline" className="ml-auto">{(stats.canceledUsers ?? []).length}</Badge>
                    {(stats.canceledUsers ?? []).length > 0 && <CopyEmailsButton emails={(stats.canceledUsers ?? []).map((u) => u.email)} />}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(stats.canceledUsers ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Aucune résiliation — 🥳</p> : (stats.canceledUsers ?? []).map((u) => (
                        <div key={u.id} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{u.name}</span>
                            <RoleBadge isTherapist={u.isTherapist} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                            <span className="text-xs text-muted-foreground">{PLAN_LABELS[u.plan] || u.plan}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Répartition abonnements</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {stats.subscriptionBreakdown.map((s) => (
                        <div key={s.status} className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xl font-bold">{s.count}</p>
                          <p className="text-xs text-muted-foreground">{SUB_LABELS[s.status] || s.status}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ════════ 6. FEATURE ADOPTION ════════ */}
            {stats.featureAdoption && stats.featureAdoption.length > 0 && (
              <div className="space-y-4">
                <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="🧪 Feature Adoption vs Rétention" subtitle="Quels exercices utilisent les gens qui restent vs ceux qui partent ? Ça guide ta roadmap." />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Corrélation exercice ↔ rétention</CardTitle>
                    <CardDescription>
                      "Rétention" = % des utilisateurs actifs (14j) qui ont utilisé cet exercice.
                      "Inactifs" = % des inactifs (30j+). Un delta positif = cet exercice corrèle avec la fidélité.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.featureAdoption.map((f) => {
                        const delta = f.retentionCorrelation - f.inactiveCorrelation;
                        return (
                          <div key={f.exercise} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{EXERCISE_LABELS[f.exercise] || f.exercise}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{f.retainedUsers} actifs · {f.inactiveUsers} inactifs</span>
                                <Badge variant={delta > 10 ? "default" : delta > 0 ? "secondary" : "outline"} className="text-xs">
                                  {delta > 0 ? "+" : ""}{delta}% delta
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground w-12">Actifs</span>
                              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(f.retentionCorrelation, 2)}%` }} />
                              </div>
                              <span className="text-xs font-medium w-8 text-right">{f.retentionCorrelation}%</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground w-12">Inactifs</span>
                              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${Math.max(f.inactiveCorrelation, 2)}%` }} />
                              </div>
                              <span className="text-xs font-medium w-8 text-right">{f.inactiveCorrelation}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 p-2 rounded bg-muted/50">
                      💡 <strong>Comment l'utiliser :</strong> Les exercices avec un delta élevé sont tes "sticky features". Pousse-les dans l'onboarding et les emails de nurturing.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ════════ 7. LIFECYCLE SCORING ════════ */}
            {stats.lifecycleStats && (
              <div className="space-y-4">
                <SectionHeader icon={<Users className="h-5 w-5" />} title="🔄 Lifecycle & Engagement" subtitle="Où en sont tes utilisateurs dans leur parcours ? Chaque segment = une stratégie email différente." />

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(STAGE_LABELS).map(([stage, config]) => {
                    const count = stats.lifecycleStats?.stageBreakdown[stage] || 0;
                    return (
                      <Card key={stage}>
                        <CardContent className="pt-4 text-center">
                          <p className="text-2xl">{config.emoji}</p>
                          <p className="text-2xl font-bold mt-1">{count}</p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Score d'engagement moyen</CardTitle>
                    <CardDescription>Score global de ta base (0-100). Objectif : &gt; 45. Combine sessions, récence, onboarding, et liens ortho-patient.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-6 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${stats.lifecycleStats.avgEngagement}%`, backgroundColor: stats.lifecycleStats.avgEngagement >= 45 ? "hsl(var(--primary))" : stats.lifecycleStats.avgEngagement >= 25 ? "#f59e0b" : "hsl(var(--destructive))" }} />
                        </div>
                      </div>
                      <span className="text-2xl font-bold">{stats.lifecycleStats.avgEngagement}/100</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xl font-bold">{stats.lifecycleStats.dormantUsers}</p>
                        <p className="text-xs text-muted-foreground">💤 Dormants</p>
                        <p className="text-xs text-muted-foreground">Inscrits, 0 session</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-500/10">
                        <p className="text-xl font-bold">{stats.lifecycleStats.coolingUsers}</p>
                        <p className="text-xs text-muted-foreground">🌡️ En refroidissement</p>
                        <p className="text-xs text-muted-foreground">Inactifs 14-30j</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-destructive/10">
                        <p className="text-xl font-bold">{stats.lifecycleStats.churnedUsers}</p>
                        <p className="text-xs text-muted-foreground">👋 Perdus</p>
                        <p className="text-xs text-muted-foreground">Inactifs 30j+</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {stats.lifecycleStats.topPowerUsers.length > 0 && (
                  <Card className="border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-base">⚡ Power Users — Tes ambassadeurs</CardTitle>
                      <CardDescription>Ceux qui utilisent le plus le produit. Transforme-les en références : témoignages, études de cas, parrainages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.lifecycleStats.topPowerUsers.map((u) => (
                          <div key={u.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{u.name}</span>
                              <RoleBadge isTherapist={u.isTherapist} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{u.totalSessions} sessions totales · {u.recentSessions} récentes</span>
                              <Badge variant="default" className="text-xs">Score {u.engagement}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ════════ 8. ANALYTICS — Funnel, Rétention ════════ */}
            {stats.analyticsStats && (
              <div className="space-y-4">
                <SectionHeader icon={<BarChart3 className="h-5 w-5" />} title="📊 Analytics Produit" subtitle="Parcours utilisateur : où tu perds des gens, qui revient." />

                {stats.analyticsStats.conversionFunnel && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Funnel de conversion</CardTitle>
                      <CardDescription>Le % de chute indique où concentrer tes efforts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.analyticsStats.conversionFunnel.map((step, i) => {
                          const maxCount = stats.analyticsStats!.conversionFunnel[0]?.count || 1;
                          const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
                          const prevCount = i > 0 ? stats.analyticsStats!.conversionFunnel[i - 1].count : step.count;
                          const dropOff = prevCount > 0 && i > 0 ? Math.round(((prevCount - step.count) / prevCount) * 100) : 0;
                          return (
                            <div key={step.step}>
                              {i > 0 && dropOff > 0 && (
                                <div className="flex items-center gap-2 py-1 pl-4"><ArrowDown className="h-3 w-3 text-destructive" /><span className="text-xs text-destructive font-medium">-{dropOff}% perdus ici</span></div>
                              )}
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm"><span className="font-medium">{step.step}</span><span className="font-bold tabular-nums">{step.count}</span></div>
                                <div className="h-7 rounded-lg bg-muted overflow-hidden relative">
                                  <div className="h-full rounded-lg transition-all" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: `hsl(${160 - i * 25}, 60%, ${50 + i * 5}%)` }} />
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{pct}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stats.analyticsStats.advancedInsights && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard title="Inscrits sans session" value={stats.analyticsStats.advancedInsights.neverSessioned} icon={Users} hint={`${stats.analyticsStats.advancedInsights.neverSessionedPct}% de la base`} />
                    <KpiCard title="Heure de pointe" value={stats.analyticsStats.advancedInsights.peakHour ? `${stats.analyticsStats.advancedInsights.peakHour.hour}h00` : "—"} icon={Clock} hint={stats.analyticsStats.advancedInsights.peakHour ? `${stats.analyticsStats.advancedInsights.peakHour.sessions} sessions` : ""} />
                    <KpiCard title="Événements (30j)" value={stats.analyticsStats.totalEvents} icon={Activity} />
                    <KpiCard title="Temps moy. → 1ère session" value={formatHours(stats.analyticsStats.advancedInsights.avgTimeToFirstSessionHours)} icon={Clock} hint={`Médiane : ${formatHours(stats.analyticsStats.advancedInsights.medianTimeToFirstSessionHours)}`} />
                  </div>
                )}

                {/* Cohorts */}
                {stats.analyticsStats.retentionCohorts?.some(c => c.signups > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Cohortes de rétention</CardTitle>
                      <CardDescription>Quel % est revenu pratiquer à J+7, J+14, J+30 ? 🟢 ≥ bon · 🟡 moyen · 🔴 à améliorer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b text-left">
                            <th className="pb-2 font-medium text-muted-foreground">Semaine</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Inscrits</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">J+7</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">J+14</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">J+30</th>
                          </tr></thead>
                          <tbody>
                            {stats.analyticsStats.retentionCohorts.filter(c => c.signups > 0).map((c) => {
                              const getColor = (val: number, t: [number, number]) => val >= t[0] ? "bg-primary/10 text-primary" : val >= t[1] ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" : "bg-destructive/10 text-destructive";
                              return (
                                <tr key={c.week} className="border-b border-border/50">
                                  <td className="py-2 font-medium">Sem. {c.week}</td>
                                  <td className="py-2 text-center font-medium">{c.signups}</td>
                                  <td className="py-2 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColor(c.d7, [50, 25])}`}>{c.d7}%</span></td>
                                  <td className="py-2 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColor(c.d14, [40, 20])}`}>{c.d14}%</span></td>
                                  <td className="py-2 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColor(c.d30, [30, 15])}`}>{c.d30}%</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stats.analyticsStats.advancedInsights?.abandonmentPages?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">🚪 Pages à optimiser</CardTitle><CardDescription>Beaucoup de vues, peu d'interactions.</CardDescription></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b text-left">
                            <th className="pb-2 font-medium text-muted-foreground">Page</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Vues</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Interactions</th>
                            <th className="pb-2 font-medium text-muted-foreground text-center">Engagement</th>
                          </tr></thead>
                          <tbody>
                            {stats.analyticsStats.advancedInsights.abandonmentPages.map((p) => (
                              <tr key={p.path} className="border-b border-border/50">
                                <td className="py-2 font-mono text-xs">{p.path}</td>
                                <td className="py-2 text-center">{p.views}</td>
                                <td className="py-2 text-center">{p.actions}</td>
                                <td className="py-2 text-center"><Badge variant={p.engagementPct < 20 ? "destructive" : p.engagementPct < 50 ? "secondary" : "default"} className="text-xs">{p.engagementPct}%</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ════════ 9. CROISSANCE ════════ */}
            <div className="space-y-4">
              <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="📈 Croissance" subtitle="Tendances d'inscription et d'utilisation." />

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <KpiCard title="Inscrits" value={stats.totalUsers} icon={Users} />
                <KpiCard title="Orthophonistes" value={stats.therapists} icon={Stethoscope} />
                <KpiCard title="Patients" value={stats.patients} icon={Users} />
                <KpiCard title="Liés à un ortho" value={stats.linkedPatients} icon={UserCheck} hint={`${stats.patients > 0 ? Math.round((stats.linkedPatients / stats.patients) * 100) : 0}%`} />
                <KpiCard title="Actifs (7j)" value={stats.activeCount} icon={Activity} />
                <KpiCard title="Sessions" value={stats.totalSessions} icon={BarChart3} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Inscriptions / semaine</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={stats.weeklySignups}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="week" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" name="Inscriptions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Sessions / jour (14j)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.dailySessions}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ════════ 10. RÉSEAU ORTHO ════════ */}
            {stats.therapistPatientMap?.length > 0 && (
              <div className="space-y-4">
                <SectionHeader icon={<Stethoscope className="h-5 w-5" />} title="🏥 Réseau Ortho → Patients" subtitle="Qui utilise réellement l'outil avec ses patients ?" />
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stats.therapistPatientMap.map((t) => (
                        <div key={t.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t.name}</span>
                              <Badge variant={t.subscriptionStatus === "active" ? "default" : "secondary"} className="text-xs">{SUB_LABELS[t.subscriptionStatus] || t.subscriptionStatus}</Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">{t.patientCount} patient{t.patientCount > 1 ? "s" : ""}</Badge>
                          </div>
                          {t.patientCount > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pl-6">
                              {t.patients.map((p) => <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-background border">{p.name}</span>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ════════ 11. PIPELINE FROID ════════ */}
            {stats.unpaidTherapistList?.length > 0 && (
              <div className="space-y-4">
                <SectionHeader icon={<Mail className="h-5 w-5" />} title="📧 Pipeline froid" subtitle="Orthos non converties — cible pour nurturing email." />
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <Badge variant="outline">{stats.unpaidTherapistList.length} orthos</Badge>
                    <CopyEmailsButton emails={stats.unpaidTherapistList.map((t) => t.email)} />
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left">
                          <th className="pb-2 font-medium text-muted-foreground">Nom</th>
                          <th className="pb-2 font-medium text-muted-foreground">Email</th>
                          <th className="pb-2 font-medium text-muted-foreground">Statut</th>
                          <th className="pb-2 font-medium text-muted-foreground text-center">Patients</th>
                          <th className="pb-2 font-medium text-muted-foreground">Inscription</th>
                        </tr></thead>
                        <tbody>
                          {stats.unpaidTherapistList.map((t) => (
                            <tr key={t.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-2 font-medium">{t.name}</td>
                              <td className="py-2 text-muted-foreground text-xs">{t.email}</td>
                              <td className="py-2"><Badge variant={t.trialExpired ? "destructive" : "secondary"} className="text-xs">{t.trialExpired ? "Expiré" : "En essai"}</Badge></td>
                              <td className="py-2 text-center">{t.patientCount}</td>
                              <td className="py-2 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("fr-FR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ════════ 12. PRODUIT ════════ */}
            <div className="space-y-4">
              <SectionHeader icon={<Mic className="h-5 w-5" />} title="🎯 Produit & Engagement" subtitle="Exercices, métriques, volume d'utilisation." />
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Popularité des exercices</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.exerciseBreakdown.sort((a, b) => b.value - a.value).map((ex, i) => {
                        const total = stats.exerciseBreakdown.reduce((s, e) => s + e.value, 0);
                        const pct = total > 0 ? Math.round((ex.value / total) * 100) : 0;
                        return (
                          <div key={ex.name} className="space-y-1">
                            <div className="flex justify-between text-sm"><span className="font-medium">{EXERCISE_LABELS[ex.name] || ex.name}</span><span className="text-muted-foreground">{ex.value} ({pct}%)</span></div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <KpiCard title="Durée moy." value={`${stats.avgDuration}s`} icon={Clock} />
                    <KpiCard title="Vitesse moy." value={wpmToSps(stats.avgWpm)} icon={Gauge} suffix=" syll/s" />
                    <KpiCard title="Enregistrement" value={`${stats.recordingRate}%`} icon={Mic} />
                  </div>
                  {stats.analyticsStats && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Événements / jour</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={stats.analyticsStats.dailyEvents}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {stats.analyticsStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Pages les + visitées</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stats.analyticsStats.topPages.map((p) => (
                          <div key={p.path} className="flex justify-between text-sm"><span className="font-mono text-xs truncate max-w-[180px]">{p.path}</span><Badge variant="outline">{p.count}</Badge></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Top interactions</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stats.analyticsStats.topEvents.map((e) => (
                          <div key={e.name} className="flex justify-between text-sm"><span className="text-xs truncate max-w-[180px]">{e.name}</span><Badge variant="outline">{e.count}</Badge></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Étapes de funnel</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stats.analyticsStats.funnelSteps.length === 0 ? <p className="text-sm text-muted-foreground">Pas encore de données</p> : stats.analyticsStats.funnelSteps.map((f) => (
                          <div key={f.name} className="flex justify-between text-sm"><span className="text-xs truncate max-w-[180px]">{f.name.replace("funnel:", "")}</span><Badge variant="secondary">{f.count}</Badge></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* ════════ 13. COÛTS ════════ */}
            {stats.deepgramStats && (
              <div className="space-y-4">
                <SectionHeader icon={<DollarSign className="h-5 w-5" />} title="💸 Coûts infra (Deepgram)" subtitle="Suivi des coûts de reconnaissance vocale." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard title="Coût total" value={`$${stats.deepgramStats.costTotal}`} icon={DollarSign} />
                  <KpiCard title="Ce mois" value={`$${stats.deepgramStats.costThisMonth}`} icon={DollarSign} />
                  <KpiCard title="Cette semaine" value={`$${stats.deepgramStats.costThisWeek}`} icon={DollarSign} />
                  <KpiCard title="Moy. / session" value={`$${stats.deepgramStats.avgPerSession}`} icon={Clock} hint={`${stats.deepgramStats.totalMinutes} min totales`} />
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">Coût par exercice</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.deepgramStats.byExercise.map((ex, i) => {
                        const maxCost = stats.deepgramStats.byExercise[0]?.cost || 1;
                        const pct = maxCost > 0 ? Math.round((ex.cost / maxCost) * 100) : 0;
                        return (
                          <div key={ex.type} className="space-y-1">
                            <div className="flex justify-between text-sm"><span className="font-medium">{EXERCISE_LABELS[ex.type] || ex.type}</span><span className="text-muted-foreground">${ex.cost} · {ex.minutes} min · {ex.sessions} sessions</span></div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} /></div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Tarif Nova-2 streaming : ${stats.deepgramStats.ratePerMin}/min</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
