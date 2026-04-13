import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLimitCheck } from "@/hooks/useLimitCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Share2, Clock, TrendingUp, Award, Copy, Check, MessageSquare, Send, Loader2, BarChart3, FileAudio, FlaskConical, RotateCcw, Trash2 } from "lucide-react";
import CoachBilan from "@/components/practice/CoachBilan";
import FillerCard from "@/components/practice/FillerCard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ClinicalWaveform, ClinicalMetricsBar, PatientEvolutionChart, TranscriptHeatmap } from "@/components/clinical";
import SpeedComplianceBar from "@/components/practice/SpeedComplianceBar";
import { getEducationalFeedback, getWpmColorClasses } from "@/lib/clinicalSummary";
import { wpmToSps, getTargetLevelBySPS } from "@/lib/spsUtils";
import { Target } from "lucide-react";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";
import { getExerciseBilanConfig } from "@/lib/exerciseBilanConfig";
import ClutteringCard from "@/components/practice/ClutteringCard";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  author_id: string;
  author_name?: string;
}

interface Session {
  id: string;
  user_id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  target_wpm: number | null;
  recording_url: string | null;
  wpm_data: WpmDataPoint[];
  word_timestamps?: WordTimestamp[] | null;
  notes: string | null;
  exercise_type?: string | null;
  word_count?: number;
  patient_sentiment?: string | null;
  filler_count?: number;
  filler_details?: Record<string, number>;
}

interface PatientSession {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
}

interface Profile {
  is_therapist: boolean;
  is_premium: boolean;
  linked_therapist_id: string | null;
  full_name: string | null;
}

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPremium, isTherapist, linkedTherapistValid } = useLimitCheck();
  const hasFullAccess = isPremium || isTherapist || linkedTherapistValid;
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientSessions, setPatientSessions] = useState<PatientSession[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [audioLoadError, setAudioLoadError] = useState(false);
  const [showDisfluencyAnalysis, setShowDisfluencyAnalysis] = useState(false);
  const [deletingRecording, setDeletingRecording] = useState(false);

  const loadSignedUrl = async (recordingUrl: string) => {
    setAudioLoadError(false);
    const pathMatch = recordingUrl.match(/recordings\/(.+)$/);
    const filePath = pathMatch ? pathMatch[1] : recordingUrl;
    
    // Try signed URL first (works for own files + therapists with storage RLS)
    const { data: signedData, error: signedError } = await supabase.storage
      .from("recordings")
      .createSignedUrl(filePath, 3600);
    
    if (!signedError && signedData?.signedUrl) {
      setSignedAudioUrl(signedData.signedUrl);
      return;
    }
    
    // Fallback: bucket is public, use public URL
    console.warn("Signed URL failed, falling back to public URL:", signedError?.message);
    const { data: publicData } = supabase.storage
      .from("recordings")
      .getPublicUrl(filePath);
    
    if (publicData?.publicUrl) {
      setSignedAudioUrl(publicData.publicUrl);
    } else {
      setAudioLoadError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_therapist, is_premium, linked_therapist_id, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch session
        const { data: sessionData, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (sessionData) {
          // Derive filler data from word_timestamps (available in DB for all sessions)
          let fillerCount = 0;
          let fillerDetails: Record<string, number> = {};
          
          const wordTimestamps = sessionData.word_timestamps as unknown as Array<{ word: string; isFiller?: boolean; fillerKey?: string }> | null;
          if (wordTimestamps && Array.isArray(wordTimestamps)) {
            for (const wt of wordTimestamps) {
              if (wt.isFiller) {
                fillerCount++;
                // Use fillerKey if available (preserves two-word fillers like "en fait")
                const key = wt.fillerKey || wt.word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
                fillerDetails[key] = (fillerDetails[key] || 0) + 1;
              }
            }
          }
          
          // Fallback to localStorage for older sessions without isFiller flag
          if (fillerCount === 0) {
            try {
              const savedFillers = localStorage.getItem(`session_fillers_${sessionData.id}`);
              if (savedFillers) {
                const parsed = JSON.parse(savedFillers);
                fillerCount = parsed.fillerCount || 0;
                fillerDetails = parsed.fillerDetails || {};
              }
            } catch (e) {
              console.error('Error loading filler data:', e);
            }
          }
          
          setSession({
            ...sessionData,
            wpm_data: (sessionData.wpm_data as unknown as WpmDataPoint[]) || [],
            word_timestamps: (sessionData.word_timestamps as unknown as WordTimestamp[]) || null,
            filler_count: fillerCount,
            filler_details: fillerDetails,
          });
          
          // Generate signed URL for audio playback (secure access)
          if (sessionData.recording_url) {
            await loadSignedUrl(sessionData.recording_url);
          }

          // If therapist viewing patient's session, get patient info and history
          if (profileData?.is_therapist && sessionData.user_id !== user.id) {
            // Get patient name
            const { data: patientProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", sessionData.user_id)
              .maybeSingle();
            
            if (patientProfile) {
              setPatientName(patientProfile.full_name);
            }

            // Get patient's session history for evolution chart
            const { data: historySessions } = await supabase
              .from("sessions")
              .select("id, created_at, duration_seconds, avg_wpm, max_wpm")
              .eq("user_id", sessionData.user_id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (historySessions) {
              setPatientSessions(historySessions);
            }
          }

          // Fetch comments for this session
          const { data: commentsData } = await supabase
            .from("session_comments")
            .select("*")
            .eq("session_id", id)
            .order("created_at", { ascending: true });

          if (commentsData) {
            const authorIds = [...new Set(commentsData.map(c => c.author_id))];
            const { data: authors } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", authorIds);

            const authorMap = new Map(authors?.map(a => [a.id, a.full_name]) || []);

            setComments(commentsData.map(c => ({
              ...c,
              author_name: authorMap.get(c.author_id) || "Inconnu"
            })));

            // Mark comments as read if user is the session owner
            if (sessionData.user_id === user.id) {
              const unreadIds = commentsData.filter(c => !c.is_read && c.author_id !== user.id).map(c => c.id);
              if (unreadIds.length > 0) {
                await supabase
                  .from("session_comments")
                  .update({ is_read: true })
                  .in("id", unreadIds);
              }
            }
          }
        } else {
          toast.error("Session non trouvée");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session || !user) return;
    setSubmittingComment(true);

    try {
      const { data, error } = await supabase
        .from("session_comments")
        .insert({
          session_id: session.id,
          author_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      const { data: authorData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setComments(prev => [...prev, {
        ...data,
        author_name: authorData?.full_name || "Vous"
      }]);
      setNewComment("");
      toast.success("Feedback envoyé !");

      // Send notification email to patient (fire-and-forget)
      if (session.user_id !== user.id) {
        supabase.functions.invoke("notify-comment", {
          body: {
            sessionId: session.id,
            patientId: session.user_id,
            therapistId: user.id,
            commentPreview: newComment.trim(),
          },
        }).catch(err => console.error("Failed to notify patient:", err));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPerformanceLevel = (avgWpm: number) => {
    if (avgWpm <= 140) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (avgWpm <= 160) return { label: "Très bien", color: "text-green-500", bg: "bg-green-50" };
    if (avgWpm <= 180) return { label: "Bien", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "À améliorer", color: "text-red-600", bg: "bg-red-100" };
  };

  const handleShare = async () => {
    if (!session) return;

    const avgSps = wpmToSps(session.avg_wpm);
    
    const shareText = `🎯 Session ParlerMoinsVite
📅 ${formatDate(session.created_at)}
⏱️ Durée : ${formatDuration(session.duration_seconds)}
📊 Vitesse moyenne : ${avgSps} syllabes/sec
🏆 Performance : ${getPerformanceLevel(session.avg_wpm).label}

${session.recording_url ? `🎧 Enregistrement disponible` : ""}`;

    try {
      // Méthode moderne (API Clipboard)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback pour les anciens navigateurs ou contextes non-sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('execCommand copy failed');
        }
      }
      setCopied(true);
      toast.success("Résumé copié dans le presse-papiers");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erreur de copie:", error);
      toast.error("Impossible de copier. Essayez de sélectionner le texte manuellement.");
    }
  };

  const handleDeleteRecording = async () => {
    if (!session?.recording_url || !confirm("Supprimer cet enregistrement audio ? Cette action est irréversible.")) return;
    setDeletingRecording(true);
    try {
      const pathMatch = session.recording_url.match(/recordings\/(.+)$/);
      const filePath = pathMatch ? pathMatch[1] : session.recording_url;
      
      const { error: storageError } = await supabase.storage
        .from("recordings")
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Clear recording_url in session
      await supabase
        .from("sessions")
        .update({ recording_url: null })
        .eq("id", session.id);
      
      setSession(prev => prev ? { ...prev, recording_url: null } : prev);
      setSignedAudioUrl(null);
      toast.success("Enregistrement supprimé");
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingRecording(false);
    }
  };
  const canComment = profile?.is_therapist && session && session.user_id !== user?.id;

  const isOwnSession = session?.user_id === user?.id;
  const isTherapistView = profile?.is_therapist && !isOwnSession;
  const isDiscoverySession = isOwnSession && profile?.is_therapist;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const performance = getPerformanceLevel(session.avg_wpm);
  const bilanCfg = getExerciseBilanConfig(session.exercise_type);

  return (
    <div className={`min-h-screen ${isTherapistView ? "bg-gradient-to-br from-purple-50 via-background to-accent/30" : "bg-gradient-to-br from-secondary via-background to-accent/30"}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 ${isTherapistView ? "border-t-2 border-t-purple-500 border-border/50 bg-background/80" : "border-border/50 bg-background/80"} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (isTherapistView && patientSessions.length > 0) {
                navigate(`/patient/${session.user_id}`);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isTherapistView ? `Retour à ${patientName || "Patient"}` : "Retour"}</span>
          </button>
          
          {isTherapistView && (
            <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-medium">Vue Clinique</span>
            </div>
          )}
          
          <Button variant="outline" onClick={handleShare} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copié !" : "Partager"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Discovery mode banner for therapist's own sessions */}
          {isDiscoverySession && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
              <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Session de test — Mode découverte</p>
                <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
                  Cette session a été réalisée depuis votre compte orthophoniste. Elle n'est pas rattachée à un patient et n'apparaît pas dans les dossiers cliniques.
                </p>
              </div>
            </div>
          )}

          {/* Header with date, patient name, and exercise type */}
          {(() => {
            const bilanConfig = getExerciseBilanConfig(session.exercise_type);
            return (
              <div className="text-center mb-8">
                {isTherapistView && patientName && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">{patientName}</span>
                  </div>
                )}
                {!isTherapistView && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Séance terminée</span>
                  </div>
                )}
                {/* Exercise type badge */}
                {session.exercise_type && session.exercise_type !== "retelling" && session.exercise_type !== "latence" && (
                  <div className="flex flex-col items-center gap-0.5 mb-3">
                    <span className="text-3xl">{bilanConfig.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{bilanConfig.label}</span>
                    <span className="text-xs text-muted-foreground max-w-sm">{bilanConfig.subtitle}</span>
                  </div>
                )}
                <h1 className="text-2xl font-display font-bold mb-2">
                  {formatDate(session.created_at)}
                </h1>
              </div>
            );
          })()}

          {/* Clinical View for Therapists */}
          {isTherapistView ? (
            <Tabs defaultValue="analysis" className="space-y-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="analysis" className="gap-2">
                  <FileAudio className="w-4 h-4" />
                  Analyse Audio
                </TabsTrigger>
                <TabsTrigger value="evolution" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Historique & Progrès
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-6">
                {/* Exercise type context badge for therapist */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <span className="text-2xl">{bilanCfg.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold">{bilanCfg.label}</p>
                    <p className="text-xs text-muted-foreground">{bilanCfg.subtitle}</p>
                  </div>
                </div>
                {/* Retelling-specific analysis */}
                {session.exercise_type === "retelling" && (() => {
                  let retellingAnalysis: any = null;
                  try {
                    const parsed = session.notes ? JSON.parse(session.notes) : null;
                    retellingAnalysis = parsed?.retelling_analysis;
                  } catch {}

                  if (retellingAnalysis) {
                    const scorePercent = Math.round((retellingAnalysis.score / retellingAnalysis.total) * 100);
                    const concisionEmoji: Record<string, string> = { concis: "✅", acceptable: "🔶", digressif: "🔴" };
                    const concisionLabel: Record<string, string> = { concis: "Concis", acceptable: "Acceptable", digressif: "Digressif" };
                    const orgEmoji: Record<string, string> = { "logique": "✅", "partiellement logique": "🔶", "désorganisé": "🔴" };

                    return (
                      <div className="space-y-4">
                        {/* Score Header */}
                        <Card className="border-2 border-primary/30">
                          <CardContent className="p-6 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Exercice de restitution narrative</p>
                            <div className="text-4xl font-bold text-primary mb-1">
                              {retellingAnalysis.score}/{retellingAnalysis.total}
                            </div>
                            <p className="text-sm text-muted-foreground">points clés restitués</p>
                            <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${scorePercent}%` }} />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Key Points */}
                        <Card>
                          <CardContent className="p-4 space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">📋 Points clés</h3>
                            {retellingAnalysis.keyPointResults?.map((kp: any, i: number) => (
                              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                                kp.found
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                              }`}>
                                {kp.found ? (
                                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <span className="w-5 h-5 text-red-500 shrink-0 mt-0.5">✗</span>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{kp.keyPoint}</p>
                                  {kp.comment && <p className="text-xs text-muted-foreground mt-0.5">{kp.comment}</p>}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Concision & Organisation */}
                        <div className="grid grid-cols-2 gap-3">
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-1">Concision</p>
                              <p className="text-lg font-bold">
                                {concisionEmoji[retellingAnalysis.concision] || "🔶"} {concisionLabel[retellingAnalysis.concision] || retellingAnalysis.concision}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{retellingAnalysis.concisionComment}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-1">Organisation</p>
                              <p className="text-lg font-bold">
                                {orgEmoji[retellingAnalysis.organisation] || "🔶"} {retellingAnalysis.organisation}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{retellingAnalysis.organisationComment}</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Digressions */}
                        {retellingAnalysis.digressions?.length > 0 && (
                          <Card className="border-amber-200 dark:border-amber-800">
                            <CardContent className="p-4">
                              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                ⚠️ Digressions détectées
                              </h3>
                              <ul className="space-y-1">
                                {retellingAnalysis.digressions.map((d: string, i: number) => (
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
                              <p className="text-sm">{retellingAnalysis.globalFeedback}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }

                  return (
                    <Card className="border-dashed border-amber-200 bg-amber-50/50">
                      <CardContent className="py-6 text-center">
                        <p className="text-sm text-amber-700 font-medium">Analyse de restitution non disponible</p>
                        <p className="text-xs text-amber-600 mt-1">Cette session retelling a été enregistrée avant l'activation de la sauvegarde d'analyse.</p>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Latence-specific analysis */}
                {session.exercise_type === "latence" && (() => {
                  let latencyData: any = null;
                  try {
                    const parsed = session.notes ? JSON.parse(session.notes) : null;
                    if (parsed?.type === "latency_stats") latencyData = parsed;
                  } catch {}

                  if (latencyData && latencyData.latencyTimes?.length > 0) {
                    const times: number[] = latencyData.latencyTimes;
                    const respected = times.filter((t: number) => t >= 2).length;
                    const total = times.length;
                    const allGood = respected === total;
                    const avgLatency = Math.round((times.reduce((a: number, b: number) => a + b, 0) / total) * 10) / 10;

                    return (
                      <div className="space-y-4">
                        {/* Score Header */}
                        <Card className={`border-2 ${allGood ? "border-emerald-300 dark:border-emerald-700" : "border-primary/30"}`}>
                          <CardContent className="p-6 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Exercice de temps de latence</p>
                            <div className={`text-4xl font-bold mb-1 ${
                              allGood ? "text-emerald-600 dark:text-emerald-400" 
                              : respected >= total / 2 ? "text-amber-600 dark:text-amber-400" 
                              : "text-destructive"
                            }`}>
                              {respected}/{total}
                            </div>
                            <p className="text-sm text-muted-foreground">pauses respectées (≥ 2s)</p>
                            <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                              <div 
                                className={`h-full rounded-full transition-all ${allGood ? "bg-emerald-500" : "bg-primary"}`} 
                                style={{ width: `${(respected / total) * 100}%` }} 
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Per-question breakdown */}
                        <Card>
                          <CardContent className="p-4 space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">⏱️ Détail par question</h3>
                            <div className="space-y-2">
                              {times.map((time: number, i: number) => {
                                const isOk = time >= 2;
                                const isGreat = time >= 3;
                                return (
                                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                                    isGreat
                                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                      : isOk
                                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{isGreat ? "✅" : isOk ? "⚠️" : "❌"}</span>
                                      <span className="text-sm font-medium">Question {i + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold tabular-nums ${
                                        isGreat ? "text-emerald-600 dark:text-emerald-400"
                                        : isOk ? "text-amber-600 dark:text-amber-400"
                                        : "text-destructive"
                                      }`}>
                                        {time}s
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {isGreat ? "Parfait" : isOk ? "Presque" : "Trop vite"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Summary stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-1">Temps moyen d'attente</p>
                              <p className="text-2xl font-bold">{avgLatency}s</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {avgLatency >= 3 ? "Excellent contrôle !" : avgLatency >= 2 ? "Bon début, visez 3s" : "Essayez de ralentir le départ"}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-1">Taux de réussite</p>
                              <p className="text-2xl font-bold">{Math.round((respected / total) * 100)}%</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {allGood ? "Parfait ! 🎉" : `${total - respected} question${total - respected > 1 ? "s" : ""} trop rapide${total - respected > 1 ? "s" : ""}`}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Pedagogical message */}
                        <Card className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <p className="text-sm">
                                {allGood
                                  ? "Bravo ! Vous avez réussi à vous imposer une pause avant chaque réponse. Ce réflexe, une fois automatisé, réduit considérablement la précipitation au quotidien."
                                  : respected >= total / 2
                                  ? "Bon travail ! Vous commencez à intégrer la pause avant de parler. Continuez à vous entraîner pour que ce réflexe devienne automatique."
                                  : "Ne vous découragez pas ! La pause avant de parler est un réflexe qui s'apprend. Essayez de compter mentalement jusqu'à 3 avant de répondre."}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Standard analysis for non-retelling, non-latence sessions */}
                {session.exercise_type !== "retelling" && session.exercise_type !== "latence" && (
                  <>
                    {/* Disfluency Detection Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Label 
                              htmlFor="disfluency-toggle" 
                              className="font-medium text-foreground cursor-pointer"
                            >
                              Analyse de fluence
                            </Label>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                              En test
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                            Repère les répétitions, allongements, blocages et mots d'appui. Calcule un % de disfluences et un score de sévérité.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="disfluency-toggle"
                        checked={showDisfluencyAnalysis}
                        onCheckedChange={setShowDisfluencyAnalysis}
                      />
                    </div>

                    {/* Disfluency Heatmap (if enabled) */}
                    {showDisfluencyAnalysis && session.word_timestamps && session.word_timestamps.length > 0 && (
                      <TranscriptHeatmap 
                        wordTimestamps={session.word_timestamps} 
                        editable
                        isTherapist
                        onWordEdit={async (index, newWord) => {
                          const updated = [...session.word_timestamps!];
                          updated[index] = { ...updated[index], word: newWord };
                          setSession(prev => prev ? { ...prev, word_timestamps: updated } : prev);
                          try {
                            await supabase
                              .from("sessions")
                              .update({ word_timestamps: updated as any })
                              .eq("id", session.id);
                            toast.success("Mot corrigé");
                          } catch (e) {
                            console.error("Error updating word:", e);
                            toast.error("Erreur lors de la correction");
                          }
                        }}
                      />
                    )}
                    
                    {showDisfluencyAnalysis && (!session.word_timestamps || session.word_timestamps.length === 0) && (
                      <Card className="border-dashed border-amber-200 bg-amber-50/50">
                        <CardContent className="py-6 text-center">
                          <FlaskConical className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                          <p className="text-sm text-amber-700 font-medium">
                            Données de transcription non disponibles
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Cette session a été enregistrée avant l'activation de l'analyse des disfluences.
                            <br />
                            Les nouvelles sessions incluront ces données automatiquement.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Clinical Waveform - or Locked State for non-premium patients */}
                {signedAudioUrl ? (
                  <div className="space-y-2">
                    <ClinicalWaveform 
                      audioUrl={signedAudioUrl} 
                      wpmData={session.wpm_data}
                      targetSps={session.target_wpm ? wpmToSps(session.target_wpm) : undefined}
                      wordTimestamps={session.word_timestamps || undefined}
                    />
                    {isTherapistView && session.recording_url && (
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-2"
                          onClick={handleDeleteRecording}
                          disabled={deletingRecording}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingRecording ? "Suppression..." : "Supprimer l'enregistrement"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : audioLoadError && session.recording_url ? (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Impossible de charger l'enregistrement
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                        L'URL d'accès n'a pas pu être générée. Vérifiez votre connexion et réessayez.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => loadSignedUrl(session.recording_url!)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Réessayer
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-muted/50 border-dashed border-border">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Pas d'enregistrement audio
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Aucun audio n'a été enregistré pour cette session.
                        <br />
                        <span className="text-muted-foreground/70">Cela peut arriver sur les anciennes sessions ou en cas de problème technique lors de la sauvegarde.</span>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Metrics Bar */}
                <ClinicalMetricsBar
                  avgWpm={session.avg_wpm}
                  maxWpm={session.max_wpm}
                  targetWpm={session.target_wpm}
                  durationSeconds={session.duration_seconds}
                  wpmData={session.wpm_data}
                  wordTimestamps={session.word_timestamps}
                  isTherapist={true}
                />

                {/* Speed Compliance Bar */}
                {session.wpm_data?.length > 0 && session.target_wpm && (
                  <Card>
                    <CardContent className="p-4">
                      <SpeedComplianceBar
                        wpmData={session.wpm_data}
                        targetSps={wpmToSps(session.target_wpm)}
                        isTherapist={true}
                        wordTimestamps={session.word_timestamps ?? undefined}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Cluttering Profile - Therapist view */}
                {session.word_timestamps && session.word_timestamps.length >= 5 && session.target_wpm && (
                  <ClutteringCard
                    wordTimestamps={session.word_timestamps}
                    targetSps={wpmToSps(session.target_wpm)}
                    isTherapist={true}
                    delay={0.28}
                  />
                )}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FillerCard
                    fillerCount={session.filler_count || 0}
                    fillerDetails={session.filler_details || {}}
                  />
                </motion.div>

                {/* Patient Sentiment Display */}
                {session.patient_sentiment && (
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {session.patient_sentiment === "too_slow" && "🐢"}
                          {session.patient_sentiment === "comfortable" && "✅"}
                          {session.patient_sentiment === "too_fast" && "🐇"}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            Ressenti de {patientName || "ce patient"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.patient_sentiment === "too_slow" && "Se sentait trop lent"}
                            {session.patient_sentiment === "comfortable" && "Se sentait à l'aise"}
                            {session.patient_sentiment === "too_fast" && "Se sentait trop rapide"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      Note pour le patient
                    </CardTitle>
                    <CardDescription>
                      Envoyez un feedback personnalisé basé sur votre analyse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={`p-4 rounded-xl ${
                              comment.author_id === user?.id 
                                ? "bg-purple-50 border border-purple-200" 
                                : "bg-muted border border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-foreground">
                                {comment.author_id === user?.id ? "Vous" : comment.author_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCommentDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {canComment && (
                      <div className="space-y-3">
                        {/* Quick Emoji Feedback Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { emoji: "👍", label: "Bravo !" },
                            { emoji: "⭐", label: "Excellent travail" },
                            { emoji: "💪", label: "Persévérez" },
                            { emoji: "🎯", label: "Objectif atteint" }
                          ].map(({ emoji, label }) => (
                            <Button
                              key={emoji}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const content = `${emoji} ${label}`;
                                setNewComment(content);
                              }}
                              className="text-lg hover:bg-purple-50 hover:border-purple-300"
                              title={label}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                        
                        <Textarea
                          placeholder="Rédigez un message personnalisé ou cliquez sur un emoji ci-dessus..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="resize-none"
                          rows={4}
                        />
                        <Button 
                          onClick={handleAddComment} 
                          disabled={submittingComment || !newComment.trim()}
                          className="gap-2"
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Envoyer le feedback
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evolution" className="space-y-6">
                <PatientEvolutionChart 
                  sessions={patientSessions}
                  patientName={patientName || undefined}
                  targetSps={session.target_wpm ? wpmToSps(session.target_wpm) : undefined}
                />
              </TabsContent>
            </Tabs>
          ) : (
            /* Regular View for Patients - Personalized per exercise type */
            <>
              {/* Educational Feedback Badge - only for speed-based exercises */}
              {bilanCfg.showSpeedKPI && (() => {
              const feedback = getEducationalFeedback(session.avg_wpm, session.target_wpm);
                const colors = getWpmColorClasses(session.avg_wpm, session.target_wpm);
                return (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <div className={`inline-flex items-center gap-4 px-8 py-5 rounded-2xl ${colors.bg} border ${colors.border}`}>
                      <span className="text-4xl">{feedback.emoji}</span>
                      <div>
                        <p className={`text-xl font-bold ${colors.text}`}>{feedback.title}</p>
                        <p className="text-sm text-muted-foreground max-w-md">{feedback.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Feedback for non-speed exercises (proprioception, silence) */}
              {!bilanCfg.showSpeedKPI && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-accent/50 border border-border">
                    <span className="text-4xl">{bilanCfg.emoji}</span>
                    <div>
                      <p className="text-xl font-bold text-foreground">Exercice terminé</p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {bilanCfg.completionMessage || (session.duration_seconds >= 60 
                          ? "Bravo, vous avez tenu l'exercice jusqu'au bout."
                          : "Essayez de prolonger un peu la prochaine fois.")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Target Level Badge */}
              {bilanCfg.showSpeedKPI && session.target_wpm && session.target_wpm > 0 && (() => {
                const targetSps = wpmToSps(session.target_wpm);
                const targetLevel = getTargetLevelBySPS(targetSps);
                return (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Objectif choisi : <span className="text-primary">Niveau {targetLevel.level} — {targetLevel.label} ({targetSps} syll/sec)</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })()}

              <div className={`grid ${bilanCfg.showSpeedKPI ? "grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"} gap-4`}>
                {/* Vitesse Moyenne - Color coded - only for speed exercises */}
                {/* Vitesse Moyenne - only for speed exercises */}
                {bilanCfg.showSpeedKPI && (() => {
                  const colors = getWpmColorClasses(session.avg_wpm, session.target_wpm);
                  const avgSps = wpmToSps(session.avg_wpm);
                  return (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                      <Card className={`${colors.bg} border ${colors.border}`}>
                        <CardHeader className="pb-2 pt-5">
                          <CardDescription className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            Vitesse Moyenne
                          </CardDescription>
                          <CardTitle className={`text-4xl font-bold ${colors.text}`}>
                            {avgSps} <span className="text-lg font-normal">syll/sec</span>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })()}

                {/* Accélération max */}
                {bilanCfg.showMaxSpeedKPI && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card>
                      <CardHeader className="pb-2 pt-5">
                        <CardDescription className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Accélération max
                        </CardDescription>
                        <CardTitle className="text-4xl font-bold">
                          {wpmToSps(session.max_wpm)} <span className="text-lg font-normal text-muted-foreground">syll/sec</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.max_wpm - session.avg_wpm > 40 
                            ? "⚡ Accélérations involontaires détectées" 
                            : "✅ Débit stable"}
                        </p>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )}

                {/* Durée - always shown */}
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                  <Card>
                    <CardHeader className="pb-2 pt-5">
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Durée
                      </CardDescription>
                      <CardTitle className="text-4xl font-bold">
                        {formatDuration(session.duration_seconds)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.duration_seconds >= 180 ? "Excellente durée d'entraînement" : "Continuez à vous entraîner"}
                      </p>
                    </CardHeader>
                  </Card>
                </motion.div>

                {/* Volume Verbal */}
                {bilanCfg.showWordCount && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-2 pt-5">
                        <CardDescription className="flex items-center gap-2 text-primary/70">
                          <Award className="w-4 h-4" />
                          Volume Verbal
                        </CardDescription>
                        <CardTitle className="text-4xl font-bold text-primary">
                          {Math.round(session.avg_wpm * session.duration_seconds / 60)} <span className="text-lg font-normal">mots</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Mots prononcés pendant la session</p>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Professional Waveform Audio Player */}
              {signedAudioUrl ? (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <ClinicalWaveform 
                    audioUrl={signedAudioUrl} 
                    wpmData={session.wpm_data}
                    targetSps={session.target_wpm ? wpmToSps(session.target_wpm) : undefined}
                    wordTimestamps={session.word_timestamps || undefined}
                  />
                </motion.div>
              ) : (
                <Card className="border-dashed border-muted-foreground/30">
                  <CardContent className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <FileAudio className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Enregistrement audio non disponible pour cette session
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Les nouvelles sessions incluront l'audio automatiquement
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Speed Compliance Bar - Patient view */}
              {bilanCfg.showCompliance && session.wpm_data?.length > 0 && session.target_wpm && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.37 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <SpeedComplianceBar
                        wpmData={session.wpm_data}
                        targetSps={wpmToSps(session.target_wpm)}
                        wordTimestamps={session.word_timestamps ?? undefined}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Cluttering Profile - Patient view */}
              {session.word_timestamps && session.word_timestamps.length >= 5 && session.target_wpm && (
                <ClutteringCard
                  wordTimestamps={session.word_timestamps}
                  targetSps={wpmToSps(session.target_wpm)}
                  isTherapist={false}
                  delay={0.37}
                />
              )}

              {bilanCfg.showFillers && session.filler_count !== undefined && session.filler_count > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.38 }}
                >
                  <FillerCard
                    fillerCount={session.filler_count || 0}
                    fillerDetails={session.filler_details || {}}
                  />
                </motion.div>
              )}

              {/* Coach Bilan - Analysis with freemium gating */}
              {bilanCfg.showCoachBilan && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CoachBilan
                    avgWpm={session.avg_wpm}
                    maxWpm={session.max_wpm}
                    targetWpm={session.target_wpm || undefined}
                    wordCount={Math.round(session.avg_wpm * session.duration_seconds / 60)}
                    duration={session.duration_seconds}
                  />
                </motion.div>
              )}

              {/* Exercise-specific pedagogical tip */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.42 }}
              >
                <Card className="bg-accent/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">💡</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">
                          Le saviez-vous ?
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{bilanCfg.tip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Commentaires de l'orthophoniste
                  </CardTitle>
                  <CardDescription>
                    Les retours de votre orthophoniste apparaîtront ici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`p-4 rounded-xl ${
                            comment.author_id === user?.id 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-gradient-to-r from-chart-2/10 to-primary/5 border border-chart-2/20"
                          }`}
                        >
                          {comment.author_id !== user?.id && (
                            <div className="flex items-center gap-2 mb-2 text-chart-2">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">Message de votre orthophoniste</span>
                            </div>
                          )}
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatCommentDate(comment.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun commentaire pour le moment
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Analyse de la fluidité - Patient-friendly */}
              {bilanCfg.showDisfluency && session.word_timestamps && session.word_timestamps.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card className="border-dashed border-muted-foreground/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <CardTitle className="text-base">Fluidité de votre parole</CardTitle>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          Nouveauté
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Repère les hésitations, les répétitions et les pauses longues dans votre enregistrement
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TranscriptHeatmap wordTimestamps={session.word_timestamps} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Share CTA */}
              {isOwnSession && (
                <Card className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20">
                  <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg mb-1">
                        Partagez avec votre orthophoniste
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Copiez le résumé de votre session pour le partager facilement
                      </p>
                    </div>
                    <Button onClick={handleShare} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copier le résumé
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (isTherapistView && patientSessions.length > 0) {
                  navigate(`/patient/${session.user_id}`);
                } else {
                  navigate(-1);
                }
              }}
              className={isTherapistView ? "border-slate-600 text-slate-300 hover:bg-slate-800" : ""}
            >
              {isTherapistView ? `Voir toutes les sessions de ${patientName || "ce patient"}` : "Retour à l'exercice"}
            </Button>
            {isOwnSession && (
              <Button onClick={() => navigate("/practice")}>
                Nouvelle session
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SessionDetail;
