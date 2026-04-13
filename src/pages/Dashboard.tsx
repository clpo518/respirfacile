import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, TrendingDown, TrendingUp, Play, LogOut, ChevronRight, Minus, Settings, BookOpen, UserPlus, Sparkles, CheckCircle, Mic, ChevronDown } from "lucide-react";
import { wpmToSps, SPS_TARGET_LEVELS } from "@/lib/spsUtils";
import { ExerciseTypeBadge } from "@/lib/exerciseTypeUtils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import TherapistDashboard from "./TherapistDashboard";

import PatientProgressCard from "@/components/dashboard/PatientProgressCard";
import TherapistShareCard from "@/components/dashboard/TherapistShareCard";
import PatientHomeworkSection from "@/components/assignments/PatientHomeworkSection";
import { StreakBadge, DailyGoalRing } from "@/components/gamification";
import { useGamification } from "@/hooks/useGamification";
import AgeCalibrationModal from "@/components/onboarding/AgeCalibrationModal";
import GoalSelectionModal from "@/components/onboarding/GoalSelectionModal";
import { useLimitCheck } from "@/hooks/useLimitCheck";
import PatientWelcomeModal from "@/components/onboarding/PatientWelcomeModal";
import TrialBanner from "@/components/dashboard/TrialBanner";
import PatientReferralCard from "@/components/referral/PatientReferralCard";
import JourneyWidget from "@/components/dashboard/JourneyWidget";
import PatientExpiredOverlay from "@/components/dashboard/PatientExpiredOverlay";

interface Session {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  exercise_type?: string | null;
  recording_url?: string | null;
}

interface Profile {
  full_name: string | null;
  target_wpm: number;
  is_therapist: boolean;
  is_premium: boolean;
  linked_therapist_id: string | null;
  birth_year: number | null;
  fluency_goal: string | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({ totalSessions: 0, totalMinutes: 0, avgWpm: 0 });
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showPatientWelcome, setShowPatientWelcome] = useState(false);
  const [showGoalSelection, setShowGoalSelection] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  
  // Gamification hook
  const gamification = useGamification();

  // Show payment success toast
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Bienvenue dans l'aventure Premium ! 🎉", {
        description: "Merci pour votre confiance. Tous les exercices sont maintenant débloqués.",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 8000,
      });
      // Clean URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile including birth_year for calibration check
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, target_wpm, is_therapist, is_premium, linked_therapist_id, birth_year, onboarding_completed_at, created_at, fluency_goal")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          
          if (!profileData.is_therapist) {
            const accountAgeMs = Date.now() - new Date(profileData.created_at || 0).getTime();
            const isNewAccount = accountAgeMs < 10 * 60 * 1000; // less than 10 minutes old
            const needsOnboarding = !profileData.onboarding_completed_at && isNewAccount;
            
            if (profileData.birth_year === null) {
              // Step 1: Age calibration (then goal → welcome via handlers)
              setShowCalibrationModal(true);
            } else if (profileData.fluency_goal === null && needsOnboarding) {
              // Step 2: Goal selection was missed (e.g. page refresh after calibration)
              setShowGoalSelection(true);
            } else if (needsOnboarding) {
              // Step 3: Welcome tour only (calibration & goal already done)
              setShowPatientWelcome(true);
            }
          }
        }

        // Fetch stats + recent sessions in parallel
        const [statsRes, sessionsRes] = await Promise.all([
          supabase
            .from("sessions")
            .select("duration_seconds, avg_wpm")
            .eq("user_id", user.id),
          supabase
            .from("sessions")
            .select("id, created_at, duration_seconds, avg_wpm, max_wpm, exercise_type, recording_url")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(200),
        ]);

        // Compute aggregates client-side from full list (lightweight: 2 int columns only)
        const allRows = statsRes.data ?? [];
        if (allRows.length > 0) {
          const totalSec = allRows.reduce((acc, s) => acc + s.duration_seconds, 0);
          const meanWpm = Math.round(allRows.reduce((acc, s) => acc + s.avg_wpm, 0) / allRows.length);
          setTotalStats({
            totalSessions: allRows.length,
            totalMinutes: Math.round(totalSec / 60),
            avgWpm: meanWpm,
          });
        }

        if (sessionsRes.data) {
          setSessions(sessionsRes.data);
        }

        // sessionsToday counting removed - Content lock freemium model
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Use aggregate stats for display
  const totalSessions = totalStats.totalSessions;
  const totalMinutes = totalStats.totalMinutes;
  const avgWpm = totalStats.avgWpm;
  
  // Convert to SPS for display
  const avgSps = wpmToSps(avgWpm);
  
  // Calculate trend (compare last 2 sessions from recent list)
  const getTrend = () => {
    if (sessions.length < 2) return "neutral";
    const recent = sessions[0].avg_wpm;
    const previous = sessions[1].avg_wpm;
    if (recent < previous) return "improving";
    if (recent > previous) return "declining";
    return "neutral";
  };
  const trend = getTrend();

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

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";
  
  // Use centralized limit check for B2B access logic
  const { isPremium, linkedTherapistValid, hasActiveTrial, trialDaysRemaining, isSolo, loading: limitLoading } = useLimitCheck();
  // Patient has full access if premium OR linked to valid therapist (or solo patient with trial)
  const hasFullAccess = isPremium || linkedTherapistValid;
  
  const hasTherapist = !!profile?.linked_therapist_id;

  // Exercise type badge is now handled by ExerciseTypeBadge component

  // Handle calibration modal completion
  const handleCalibrationComplete = (birthYear: number) => {
    setShowCalibrationModal(false);
    setProfile(prev => prev ? { ...prev, birth_year: birthYear } : null);
    // Show goal selection after calibration
    setTimeout(() => {
      setShowGoalSelection(true);
    }, 300);
  };

  // Handle goal selection completion
  const handleGoalComplete = (goal: "speed" | "fluency") => {
    setShowGoalSelection(false);
    // Show patient welcome after goal selection
    setTimeout(() => {
      setShowPatientWelcome(true);
    }, 300);
  };

  // Handle patient welcome completion
  const handlePatientWelcomeClose = () => {
    setShowPatientWelcome(false);
    if (user) {
      supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id)
        .then();
    }
  };

  // If user is a therapist, show therapist dashboard
  if (profile?.is_therapist) {
    return <TherapistDashboard />;
  }

  return (
    <>
      {/* Age Calibration Modal - Shows on first login if birth_year is null */}
      {user && (
        <AgeCalibrationModal
          open={showCalibrationModal}
          userId={user.id}
          onComplete={handleCalibrationComplete}
        />
      )}
      
      {/* Goal Selection Modal - Shows after age calibration */}
      {user && (
        <GoalSelectionModal
          open={showGoalSelection && !showCalibrationModal}
          userId={user.id}
          onComplete={handleGoalComplete}
        />
      )}
      
      {/* Patient Welcome Tour - Shows once after signup */}
      <PatientWelcomeModal
        open={showPatientWelcome && !showCalibrationModal && !showGoalSelection}
        onClose={handlePatientWelcomeClose}
        patientName={profile?.full_name?.split(" ")[0]}
        hasTherapist={hasTherapist}
      />
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline">ParlerMoinsVite</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Gamification: Streak Badge */}
            {!gamification.loading && (
              <StreakBadge 
                currentStreak={gamification.currentStreak} 
                longestStreak={gamification.longestStreak}
              />
            )}
            
            {/* Gamification: Daily Goal Ring */}
            {!gamification.loading && (
              <DailyGoalRing
                todayMinutes={gamification.todayMinutes}
                dailyGoal={gamification.dailyGoal}
                goalProgress={gamification.goalProgress}
                goalCompleted={gamification.goalCompleted}
              />
            )}

            
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-1.5 tracking-tight">
              Bonjour {firstName} 👋
            </h1>
            <p className="text-muted-foreground">
              {isSolo ? "Mode Autonomie · " : ""}Votre espace d'entraînement, à votre rythme.
            </p>
          </div>

          {/* B2B Patient Expired Overlay - therapist subscription invalid */}
          {!limitLoading && hasTherapist && !linkedTherapistValid && !isPremium && (
            <PatientExpiredOverlay />
          )}

          {/* Trial Banner for solo users - wait for limit check to finish */}
          {!limitLoading && (
            <TrialBanner
              hasActiveTrial={hasActiveTrial}
              trialDaysRemaining={trialDaysRemaining}
              isSolo={isSolo}
              isPremium={isPremium}
            />
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Séances réalisées</CardDescription>
                <CardTitle className="text-3xl">{totalSessions}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Temps d'entraînement</CardDescription>
                <CardTitle className="text-3xl">{totalMinutes} min</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  Vitesse moyenne
                  {trend === "improving" && <TrendingDown className="w-4 h-4 text-green-500" />}
                  {trend === "declining" && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {trend === "neutral" && <Minus className="w-4 h-4 text-muted-foreground" />}
                </CardDescription>
                <CardTitle className="text-3xl">{avgSps} <span className="text-lg font-normal text-muted-foreground">syll/sec</span></CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
              </CardHeader>
            </Card>
          </div>

          {/* Journey Widget - Guided progression */}
          <JourneyWidget />

          {/* Patient Homework Section - Top priority */}
          <PatientHomeworkSection />

          {/* Patient Progress Card - Premium analytics */}
          <div className="mb-8">
            <PatientProgressCard sessions={sessions} targetSps={profile?.target_wpm ? wpmToSps(profile.target_wpm) : undefined} />
          </div>

          {/* Quick Action - Single CTA to Library */}
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
              <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Prêt pour une séance ?
                  </h2>
                  <p className="opacity-80 text-sm">
                    Lecture, dialogue, articulation… à vous de choisir
                  </p>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate("/library")}
                  className="gap-2 shrink-0"
                >
                  <BookOpen className="w-5 h-5" />
                  Bibliothèque
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Therapist Link CTA removed - now only in Settings page */}

          {/* Therapist Share Card - Show only for patients with a therapist */}
          {hasTherapist && (
            <div className="mb-8">
              <TherapistShareCard />
            </div>
          )}

          {/* Referral Card - Show only for solo patients */}
          {isSolo && (
            <div className="mb-8">
              <PatientReferralCard />
            </div>
          )}

          {/* Recent Sessions or Welcome Card */}
          {sessions.length === 0 && !loading ? (
            /* Welcome Card for new users */
            <Card className="bg-gradient-to-br from-accent/50 via-background to-secondary/30 border-primary/10">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">
                  Bienvenue dans votre espace ! 🎉
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Lancez votre première séance pour découvrir votre rythme de parole. C'est simple et rapide.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/library")} size="lg" className="gap-2">
                    <BookOpen className="w-5 h-5" />
                    Choisir un exercice
                  </Button>
                  <Button onClick={() => navigate("/practice")} size="lg" variant="outline" className="gap-2">
                    <Play className="w-5 h-5" />
                    Séance rapide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Historique des séances</CardTitle>
                <CardDescription>
                  {sessions.length > 0 
                    ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} enregistrée${sessions.length > 1 ? 's' : ''}`
                    : "Aucune session pour le moment"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-muted-foreground">Chargement...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(showAllSessions ? sessions : sessions.slice(0, 5)).map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.05 }}
                      >
                        <Link
                          to={`/session/${session.id}`}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-medium text-sm">{formatDate(session.created_at)}</p>
                                <ExerciseTypeBadge exerciseType={session.exercise_type} />
                                {session.recording_url && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full">
                                    <Mic className="w-3 h-3" />
                                    Audio
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDuration(session.duration_seconds)} • Moy. {wpmToSps(session.avg_wpm)} syll/sec
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                    
                    {/* Show more / less toggle */}
                    {sessions.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-3 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAllSessions(!showAllSessions)}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAllSessions ? 'rotate-180' : ''}`} />
                        {showAllSessions 
                          ? "Voir moins" 
                          : `Voir les ${sessions.length - 5} autres séances`
                        }
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
    </>
  );
};

export default Dashboard;
