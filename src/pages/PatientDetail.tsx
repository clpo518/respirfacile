import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Activity, ArrowLeft, User, Calendar, TrendingDown, TrendingUp, Clock, ChevronRight, FileText, Plus, Loader2, Lock, Trash2, Send, Gauge, X, Tag, Pencil, Check, BookOpen } from "lucide-react";
import { ExerciseTypeBadge } from "@/lib/exerciseTypeUtils";
import AssignExerciseModal from "@/components/assignments/AssignExerciseModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Tooltip as ShadTooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { generateShortSummary, getDebitStatus } from "@/lib/clinicalSummary";
import { MetricTooltip, METRIC_TOOLTIPS } from "@/components/pro/MetricTooltip";
import GenerateReportButton from "@/components/reports/GenerateReportButton";
import { wpmToSps } from "@/lib/spsUtils";
import { getAgeGroup, calculateAge, getNormSPS } from "@/lib/ageNormsUtils";
import { Target, Info } from "lucide-react";

interface Session {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  notes: string | null;
  exercise_type?: string | null;
  patient_sentiment?: string | null;
}

interface Patient {
  id: string;
  full_name: string | null;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  today_minutes: number;
  target_wpm: number | null;
  birth_year: number | null;
  clinical_tags?: string[];
}

const SUGGESTED_TAGS = [
  "TDAH", "Bégaiement", "Bredouillement", "Tachylalie", "Dysarthrie", 
  "Parkinson", "Alzheimer", "AVC", "TSA", "Trouble articulatoire",
  "Aphonie", "Dysphonie", "Retard de langage"
];

interface ClinicalNote {
  id: string;
  content: string;
  created_at: string;
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessionStats, setAllSessionStats] = useState<{ count: number; totalSeconds: number; avgWpm: number }>({ count: 0, totalSeconds: 0, avgWpm: 0 });
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetSpsInput, setTargetSpsInput] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        // Verify this patient is linked to the current therapist
        const { data: patientData, error: patientError } = await supabase
          .from("profiles")
          .select("id, full_name, linked_therapist_id, created_at, current_streak, longest_streak, today_minutes, target_wpm, birth_year, clinical_tags")
          .eq("id", id)
          .maybeSingle();

        if (patientError) throw patientError;

        if (!patientData || patientData.linked_therapist_id !== user.id) {
          toast.error("Patient non trouvé");
          navigate("/dashboard");
          return;
        }

        setPatient({
          id: patientData.id,
          full_name: patientData.full_name,
          created_at: patientData.created_at,
          current_streak: patientData.current_streak,
          longest_streak: patientData.longest_streak,
          today_minutes: patientData.today_minutes,
          target_wpm: patientData.target_wpm,
          birth_year: patientData.birth_year,
          clinical_tags: (patientData as any).clinical_tags || [],
        });

        // Track that therapist has viewed a patient bilan (for onboarding checklist)
        localStorage.setItem("pro_viewed_bilan", "true");

        // Fetch patient's sessions (display) + all stats in parallel
        const [sessionsRes, statsRes] = await Promise.all([
          supabase
            .from("sessions")
            .select("id, created_at, duration_seconds, avg_wpm, max_wpm, notes, exercise_type, patient_sentiment")
            .eq("user_id", id)
            .order("created_at", { ascending: false })
            .limit(200),
          supabase
            .from("sessions")
            .select("duration_seconds, avg_wpm")
            .eq("user_id", id),
        ]);

        if (sessionsRes.data) {
          setSessions(sessionsRes.data);
        }
        if (statsRes.data && statsRes.data.length > 0) {
          const totalSec = statsRes.data.reduce((acc, s) => acc + s.duration_seconds, 0);
          const meanWpm = Math.round(statsRes.data.reduce((acc, s) => acc + s.avg_wpm, 0) / statsRes.data.length);
          setAllSessionStats({ count: statsRes.data.length, totalSeconds: totalSec, avgWpm: meanWpm });
        }

        // Fetch clinical notes for this patient
        const { data: notesData } = await supabase
          .from("clinical_notes")
          .select("id, content, created_at")
          .eq("patient_id", id)
          .eq("therapist_id", user.id)
          .order("created_at", { ascending: false });

        if (notesData) {
          setNotes(notesData);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !id) return;

    setSavingNote(true);
    try {
      const { data, error } = await supabase
        .from("clinical_notes")
        .insert({
          patient_id: id,
          therapist_id: user.id,
          content: newNote.trim(),
        })
        .select("id, content, created_at")
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote("");
      toast.success("Note ajoutée");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("clinical_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteId));
      toast.success("Note supprimée");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!tag.trim() || !patient || !id) return;
    const normalizedTag = tag.trim();
    if (patient.clinical_tags?.includes(normalizedTag)) return;
    
    setSavingTags(true);
    const newTags = [...(patient.clinical_tags || []), normalizedTag];
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ clinical_tags: newTags } as any)
        .eq("id", id);
      if (error) throw error;
      setPatient({ ...patient, clinical_tags: newTags });
      setTagInput("");
      toast.success("Tag ajouté");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSavingTags(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!patient || !id) return;
    setSavingTags(true);
    const newTags = (patient.clinical_tags || []).filter(t => t !== tagToRemove);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ clinical_tags: newTags } as any)
        .eq("id", id);
      if (error) throw error;
      setPatient({ ...patient, clinical_tags: newTags });
      toast.success("Tag retiré");
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setSavingTags(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get sentiment icon based on patient_sentiment column
  const getSentimentIcon = (sentiment: string | null) => {
    if (!sentiment) return { icon: "—", label: "Non renseigné" };
    if (sentiment === "too_fast") return { icon: "🐇", label: "Trop rapide" };
    if (sentiment === "comfortable") return { icon: "✅", label: "Confortable" };
    if (sentiment === "too_slow") return { icon: "🐢", label: "Trop lent" };
    return { icon: "—", label: "" };
  };

  // Calculate stats from ALL sessions (not limited)
  const totalSessions = allSessionStats.count;
  const totalMinutes = Math.round(allSessionStats.totalSeconds / 60);
  const avgWpm = allSessionStats.avgWpm;

  // Chart period filter
  type PeriodFilter = "7d" | "30d" | "3m" | "all";
  const [chartPeriod, setChartPeriod] = useState<PeriodFilter>("all");
  const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
    { value: "7d", label: "7j" },
    { value: "30d", label: "30j" },
    { value: "3m", label: "3 mois" },
    { value: "all", label: "Tout" },
  ];
  const filteredSessions = useMemo(() => {
    if (chartPeriod === "all") return sessions;
    const now = new Date();
    const cutoff = new Date();
    if (chartPeriod === "7d") cutoff.setDate(now.getDate() - 7);
    else if (chartPeriod === "30d") cutoff.setDate(now.getDate() - 30);
    else cutoff.setMonth(now.getMonth() - 3);
    return sessions.filter(s => new Date(s.created_at) >= cutoff);
  }, [sessions, chartPeriod]);

  // Prepare chart data - filter out 0 SPS sessions, convert to SPS, oldest first
  const chartData = [...filteredSessions]
    .filter(s => s.avg_wpm > 0)
    .reverse()
    .map((s, i) => ({
      session: i + 1,
      avg: wpmToSps(s.avg_wpm),
      max: wpmToSps(s.max_wpm),
      date: new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    }));
  const chartTargetSps = patient?.target_wpm ? wpmToSps(patient.target_wpm) : 4.5;

  // Find best and worst sessions
  const bestSession = sessions.length > 0 
    ? sessions.reduce((best, s) => s.avg_wpm < best.avg_wpm ? s : best, sessions[0])
    : null;
  const worstSession = sessions.length > 0 
    ? sessions.reduce((worst, s) => s.avg_wpm > worst.avg_wpm ? s : worst, sessions[0])
    : null;

  // Calculate follow-up duration
  const followUpSince = patient?.created_at 
    ? new Date(patient.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux patients</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Dossier Patient</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Patient Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">
                  {patient.full_name || "Patient"}
                </h1>
                <p className="text-muted-foreground">
                  {totalSessions} session{totalSessions > 1 ? "s" : ""} • {totalMinutes} min d'entraînement
                  {followUpSince && <span> • Suivi depuis le {followUpSince}</span>}
                </p>
                {/* Clinical Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  {(patient.clinical_tags || []).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                      {tag}
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="relative">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { handleAddTag(tagInput); } }}
                      placeholder="+ Tag"
                      className="h-6 w-24 text-xs px-2 py-0 border-dashed"
                      list="suggested-tags"
                      disabled={savingTags}
                    />
                    <datalist id="suggested-tags">
                      {SUGGESTED_TAGS.filter(t => !(patient.clinical_tags || []).includes(t)).map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
              <Button
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => navigate(`/session-live?patient=${id}`)}
              >
                <Gauge className="w-4 h-4" />
                Mesurer
              </Button>
              <TooltipProvider>
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 shrink-0"
                      onClick={() => navigate(`/library?for_patient=${id}`)}
                    >
                      <BookOpen className="w-4 h-4" />
                      S'exercer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-center">
                    Lancer un exercice en séance — il sera enregistré dans le dossier du patient
                  </TooltipContent>
                </ShadTooltip>
              </TooltipProvider>
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => setAssignModalOpen(true)}
              >
                <Send className="w-4 h-4" />
                Prescrire
              </Button>
              <GenerateReportButton
                sessions={sessions}
                profile={patient}
                therapistName={user?.user_metadata?.full_name}
              />
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Monitoring (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Sessions
                    </CardDescription>
                    <CardTitle className="text-2xl">{totalSessions}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Temps total
                    </CardDescription>
                    <CardTitle className="text-2xl">{totalMinutes} min</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <MetricTooltip content={METRIC_TOOLTIPS.AVG_SPS}>
                        <Activity className="w-4 h-4" />
                        <span>Moy. SPS</span>
                      </MetricTooltip>
                    </CardDescription>
                    {(() => {
                      const sps = wpmToSps(avgWpm);
                      return (
                        <CardTitle className={`text-2xl ${sps <= 4.0 ? "text-green-600" : sps <= 5.0 ? "text-yellow-600" : "text-red-600"}`}>
                          {sps}
                        </CardTitle>
                      );
                    })()}
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <MetricTooltip content="Pourcentage de sessions où le débit moyen est resté sous l'objectif personnalisé">
                        <Target className="w-4 h-4" />
                        <span>Dans la cible</span>
                      </MetricTooltip>
                    </CardDescription>
                    {(() => {
                      const targetSps = patient.target_wpm ? wpmToSps(patient.target_wpm) : 4.5;
                      const inTarget = sessions.filter(s => wpmToSps(s.avg_wpm) <= targetSps).length;
                      const pct = sessions.length > 0 ? Math.round((inTarget / sessions.length) * 100) : 0;
                      return (
                        <CardTitle className={`text-2xl ${pct >= 60 ? "text-green-600" : pct >= 30 ? "text-yellow-600" : "text-red-600"}`}>
                          {pct}%
                        </CardTitle>
                      );
                    })()}
                  </CardHeader>
                </Card>
              </div>

              {/* Therapist target SPS editor */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Objectif de vitesse</p>
                        {!editingTarget ? (
                          <p className="text-2xl font-bold text-primary">
                            {patient.target_wpm ? wpmToSps(patient.target_wpm) : "—"} 
                            <span className="text-sm font-normal text-muted-foreground ml-1">syll/s</span>
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              step="0.5"
                              value={targetSpsInput}
                              onChange={(e) => setTargetSpsInput(e.target.value)}
                              className="w-20 h-8 text-sm"
                              autoFocus
                            />
                            <span className="text-xs text-muted-foreground">syll/s</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={savingTarget}
                              onClick={async () => {
                                const val = parseFloat(targetSpsInput);
                                if (isNaN(val) || val < 1 || val > 10) {
                                  toast.error("Valeur entre 1 et 10 syll/s");
                                  return;
                                }
                                setSavingTarget(true);
                                const { error } = await supabase.rpc("set_patient_target_sps", {
                                  patient_uuid: patient.id,
                                  target_sps: val,
                                } as any);
                                setSavingTarget(false);
                                if (error) {
                                  toast.error("Erreur lors de la sauvegarde");
                                  console.error(error);
                                } else {
                                  toast.success("Objectif mis à jour");
                                  setPatient({ ...patient, target_wpm: Math.round(val * 60 / 1.8) });
                                  setEditingTarget(false);
                                }
                              }}
                            >
                              {savingTarget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingTarget(false)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!editingTarget && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTargetSpsInput(patient.target_wpm ? wpmToSps(patient.target_wpm).toString() : "4.5");
                          setEditingTarget(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>
                  {patient.birth_year && !editingTarget && (
                    <p className="text-xs text-muted-foreground mt-2 ml-13">
                      {(() => {
                        const norm = getNormSPS(patient.birth_year!);
                        return `Norme d'âge (${calculateAge(patient.birth_year!)} ans) : ${norm} syll/s — cible recommandée : ${(norm - 1).toFixed(1)} syll/s`;
                      })()}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Access: Best & Worst */}
              {sessions.length >= 2 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {bestSession && (
                    <Card 
                      className="bg-green-500/10 border-green-500/20 cursor-pointer hover:bg-green-500/15 transition-colors"
                      onClick={() => navigate(`/session/${bestSession.id}`)}
                    >
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700">Meilleure session</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(bestSession.created_at)} • {wpmToSps(bestSession.avg_wpm)} syll/s
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-green-600" />
                      </CardContent>
                    </Card>
                  )}
                  
                  {worstSession && worstSession.id !== bestSession?.id && (
                    <Card 
                      className="bg-red-500/10 border-red-500/20 cursor-pointer hover:bg-red-500/15 transition-colors"
                      onClick={() => navigate(`/session/${worstSession.id}`)}
                    >
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="font-medium text-red-700">Session à revoir</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(worstSession.created_at)} • {wpmToSps(worstSession.avg_wpm)} syll/s
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-600" />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Evolution Chart */}
              {chartData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution sur les dernières séances</CardTitle>
                    <CardDescription>
                      Vitesse moyenne (syll/sec) au fil du temps
                    </CardDescription>
                    <div className="flex gap-1 pt-1">
                      {PERIOD_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setChartPeriod(opt.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            chartPeriod === opt.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            domain={[2, 8]}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--foreground))",
                            }}
                            labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            formatter={(value: number, name: string) => [
                              `${value.toFixed(1)} syll/s`,
                              "Moyenne"
                            ]}
                          />
                          <ReferenceLine 
                            y={chartTargetSps} 
                            stroke="hsl(var(--primary))" 
                            strokeDasharray="6 4"
                            strokeWidth={1.5}
                            label={{ value: `Cible (${chartTargetSps})`, position: "right", fontSize: 10, fill: "hsl(var(--primary))" }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg" 
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            name="avg"
                            dot={{ fill: "hsl(var(--primary))", r: 3.5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Vitesse moyenne</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-[2px] bg-destructive/50 rounded" />
                        <span className="text-muted-foreground">Vitesse max</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-[2px] border-t-[2px] border-dashed border-primary" />
                        <span className="text-muted-foreground">Cible ({chartTargetSps})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sessions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique des sessions</CardTitle>
                  <CardDescription>
                    Cliquez sur une session pour voir les détails et l'écouter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sessions.map((session) => {
                        const sentiment = getSentimentIcon(session.patient_sentiment);
                        const debitStatus = getDebitStatus(session.avg_wpm);
                        const shortSummary = generateShortSummary(session.avg_wpm);
                        
                        // Color classes for the clinical summary badge
                        const statusColorClasses = {
                          green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                          yellow: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                          red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
                          gray: "bg-muted text-muted-foreground border-border",
                        };
                        
                        return (
                          <Link
                            key={session.id}
                            to={`/session/${session.id}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-medium">{formatDate(session.created_at)}</p>
                                  <ExerciseTypeBadge exerciseType={session.exercise_type} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(session.duration_seconds)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Bilan Rapide - Clinical Summary for quick scan */}
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColorClasses[debitStatus.color]}`}>
                                {shortSummary}
                              </div>
                              <div className="text-right hidden sm:block">
                                <span className="text-xl" title={sentiment.label}>{sentiment.icon}</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ce patient n'a pas encore de session</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Clinical Notes (1/3 width) */}
            <div className="space-y-6">
              <Card className="border-2 border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Notes de Suivi
                    <Lock className="w-4 h-4 text-amber-600" />
                  </CardTitle>
                  <CardDescription>
                    Notes privées - Le patient n'y a pas accès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ajouter une observation clinique..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px] resize-none bg-background"
                    />
                    <Button 
                      onClick={handleAddNote} 
                      disabled={savingNote || !newNote.trim()}
                      className="w-full gap-2"
                    >
                      {savingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Ajouter une note
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <div 
                          key={note.id} 
                          className="p-3 rounded-lg bg-background border border-border group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              {formatNoteDate(note.created_at)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune note pour ce patient</p>
                        <p className="text-xs mt-1">
                          Ajoutez vos observations cliniques ici
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Notice */}
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Confidentialité</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ces notes sont strictement privées et protégées par des règles de sécurité. 
                      Seul vous pouvez les lire et les modifier. Le patient n'y a jamais accès.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Assign Exercise Modal */}
      <AssignExerciseModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        preselectedPatientId={patient.id}
        preselectedPatientName={patient.full_name || "Patient"}
      />
    </div>
  );
};

export default PatientDetail;