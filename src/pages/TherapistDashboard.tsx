import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Settings, LogOut, Users, UserPlus, Copy, Check, AlertCircle, Eye, Mail, ExternalLink, Flame, Archive, RotateCcw, CheckCircle, Lightbulb, FlaskConical, Gauge, Search, BellRing, Share2, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { wpmToSps } from "@/lib/spsUtils";
import { copyToClipboard } from "@/lib/clipboard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MetricsInfoCard } from "@/components/pro/MetricsInfoCard";
import { getDaysSinceActivity, getRetentionStatus, type RetentionStatus } from "@/hooks/useGamification";
import { Badge } from "@/components/ui/badge";
import TrialBanner from "@/components/pro/TrialBanner";
import ExpiredOverlay from "@/components/pro/ExpiredOverlay";
import WelcomeTourModal from "@/components/pro/WelcomeTourModal";
import SeatCounter from "@/components/pro/SeatCounter";
import ReferralCard from "@/components/pro/ReferralCard";
import WhatsNewModal from "@/components/pro/WhatsNewModal";
import PatientActivityHeatmap from "@/components/pro/PatientActivityHeatmap";
import OnboardingChecklist from "@/components/pro/OnboardingChecklist";
import RecommendButton from "@/components/pro/RecommendButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Patient {
  id: string;
  full_name: string | null;
  last_session_date: string | null;
  last_activity_date: string | null;
  avg_wpm: number | null;
  sessions_this_week: number;
  has_unread_comments: boolean;
  current_streak: number;
  is_archived: boolean;
  clinical_tags: string[];
  // Calculated
  daysSinceActivity: number;
  retentionStatus: RetentionStatus;
}

interface Profile {
  full_name: string | null;
  therapist_code: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  is_premium: boolean;
  seats_limit: number;
  referral_code: string | null;
}

interface TherapistStatus {
  isValid: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
}

const TherapistDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [therapistStatus, setTherapistStatus] = useState<TherapistStatus | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [archivingPatient, setArchivingPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nudgingPatient, setNudgingPatient] = useState<string | null>(null);
  const [heatmapSessions, setHeatmapSessions] = useState<{ id: string; full_name: string | null; sessions: { created_at: string }[] }[]>([]);
  const [totalSessionCount, setTotalSessionCount] = useState(0);
  const [hasAssignedExercise, setHasAssignedExercise] = useState(false);
  
  const [nudgedPatients, setNudgedPatients] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("nudgedPatients") || "{}");
    } catch { return {}; }
  });

  // Show payment success toast
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Abonnement activé ! 🎉", {
        description: "Merci pour votre confiance. Vos sièges sont maintenant débloqués.",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 8000,
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch therapist profile with B2B fields
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, therapist_code, trial_start_date, trial_end_date, subscription_plan, subscription_status, is_premium, seats_limit, onboarding_completed_at, created_at, referral_code")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);

          // Calculate therapist status
          const now = new Date();
          const trialEndDate = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
          const trialStartDate = profileData.trial_start_date ? new Date(profileData.trial_start_date) : null;
          const fallbackDaysSinceStart = trialStartDate
            ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const isTrialExpired = trialEndDate
            ? trialEndDate <= now
            : trialStartDate
              ? fallbackDaysSinceStart >= 30
              : false;

          const daysRemaining = trialEndDate
            ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : trialStartDate
              ? Math.max(0, 30 - fallbackDaysSinceStart)
              : 30;

          const isSubscriptionActive = profileData.subscription_status === 'active' || profileData.is_premium === true;
          const isTrialActive = profileData.subscription_plan === 'trial' && !isTrialExpired;

          setTherapistStatus({
            isValid: !isTrialExpired || isSubscriptionActive,
            isTrialActive,
            isTrialExpired: isTrialExpired && !isSubscriptionActive,
            daysRemaining,
          });

          // Show welcome tour only if never completed AND account is fresh (< 10 min old)
          const accountAgeMs = Date.now() - new Date(profileData.created_at || 0).getTime();
          const isNewAccount = accountAgeMs < 10 * 60 * 1000;
          if (!profileData.onboarding_completed_at && trialStartDate && isNewAccount) {
            setShowWelcomeTour(true);
          }
        }

        // Fetch linked patients including archived ones
        const { data: patientsData } = await supabase
          .from("profiles")
          .select("id, full_name, last_activity_date, current_streak, is_archived, clinical_tags")
          .eq("linked_therapist_id", user.id);

        if (patientsData && patientsData.length > 0) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          // Get stats for each patient
          const patientsWithStats = await Promise.all(
            patientsData.map(async (patient) => {
              const { data: sessions } = await supabase
                .from("sessions")
                .select("id, created_at, avg_wpm")
                .eq("user_id", patient.id)
                .order("created_at", { ascending: false })
                .limit(10);

              const lastSession = sessions?.[0];
              const sessionsThisWeek = sessions?.filter(s => 
                new Date(s.created_at) > weekAgo
              ).length || 0;
              const avgWpm = sessions && sessions.length > 0
                ? Math.round(sessions.reduce((acc, s) => acc + s.avg_wpm, 0) / sessions.length)
                : null;

              // Calculate retention metrics
              const daysSinceActivity = getDaysSinceActivity(patient.last_activity_date);
              const retentionStatus = getRetentionStatus(daysSinceActivity);

              return {
                ...patient,
                last_session_date: lastSession?.created_at || null,
                avg_wpm: avgWpm,
                sessions_this_week: sessionsThisWeek,
                has_unread_comments: false,
                current_streak: patient.current_streak || 0,
                is_archived: patient.is_archived || false,
                clinical_tags: (patient as any).clinical_tags || [],
                daysSinceActivity,
                retentionStatus,
              };
            })
          );
          
          // Sort by retention risk (dropouts first, then slipping, then active)
          const sortedPatients = patientsWithStats.sort((a, b) => {
            const statusOrder: Record<RetentionStatus, number> = { dropout: 0, slipping: 1, new: 2, active: 3 };
            return statusOrder[a.retentionStatus] - statusOrder[b.retentionStatus];
          });
          
          setPatients(sortedPatients);

          // Build heatmap data: fetch last 14 days sessions per patient
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          const heatmapData = await Promise.all(
            patientsData.filter(p => !p.is_archived).map(async (patient) => {
              const { data: recentSessions } = await supabase
                .from("sessions")
                .select("created_at")
                .eq("user_id", patient.id)
                .gte("created_at", fourteenDaysAgo.toISOString());
              return {
                id: patient.id,
                full_name: patient.full_name,
                sessions: recentSessions || [],
              };
            })
          );
          setHeatmapSessions(heatmapData);

          // Fetch total session count across all patients (for smart trial banner)
          const patientIds = patientsData.map(p => p.id);
          const { count: sessCount } = await supabase
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .in("user_id", patientIds);
          setTotalSessionCount(sessCount || 0);

          // Check if therapist has assigned any exercise
          const { count: assignCount } = await supabase
            .from("assignments")
            .select("id", { count: "exact", head: true })
            .eq("therapist_id", user.id);
          setHasAssignedExercise((assignCount || 0) > 0);

        }
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const copyInviteCode = async () => {
    if (!profile?.therapist_code) {
      toast.error("Aucun code d'invitation disponible");
      return;
    }

    const success = await copyToClipboard(profile.therapist_code);
    if (success) {
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const copyEmailTemplate = async () => {
    if (!profile?.therapist_code) {
      toast.error("Aucun code d'invitation disponible");
      return;
    }

    const emailTemplate = `Objet : Invitation : Votre outil d'entraînement à la maison 🗣️

Bonjour,

Pour compléter nos séances et accélérer vos progrès, je vous invite à utiliser l'application ParlerMoinsVite.

C'est un outil interactif conçu pour vous aider au quotidien :

🎯 Mode Guidé : Un surligneur vous guide mot par mot au rythme idéal pour ancrer de bonnes habitudes.

🌊 Analyse de la forme d'onde : Après chaque exercice, visualisez vos pauses et accélérations pour comprendre votre débit.

📖 Exercices guidés : Accédez à une bibliothèque de textes (lecture lente, articulation) directement sur votre téléphone.

🤝 Suivi à distance : En liant votre compte au mien, je pourrai écouter vos exercices et vous conseiller entre deux rendez-vous.

Pour commencer, c'est très simple :

1. Allez sur https://www.parlermoinsvite.fr
2. Créez votre compte gratuit avec mon Code Pro : ${profile.therapist_code}

À très bientôt !`;

    const success = await copyToClipboard(emailTemplate);
    if (success) {
      setEmailCopied(true);
      toast.success("Modèle d'email copié !");
      setTimeout(() => setEmailCopied(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const openMailClient = () => {
    if (!profile?.therapist_code) {
      toast.error("Aucun code d'invitation disponible");
      return;
    }

    const subject = encodeURIComponent("Votre outil d'entraînement à la maison 🗣️");
    const body = encodeURIComponent(`Bonjour,

Pour compléter nos séances et accélérer vos progrès, je vous invite à utiliser l'application ParlerMoinsVite.

C'est un outil interactif conçu pour vous aider au quotidien :

🎯 Mode Guidé : Un surligneur vous guide mot par mot au rythme idéal.
🌊 Analyse audio : Visualisez vos pauses et accélérations après chaque exercice.
📖 Exercices guidés : Accédez à une bibliothèque de textes directement sur votre téléphone.
🤝 Suivi à distance : En liant votre compte au mien, je pourrai suivre vos exercices.

Pour commencer :

1. Allez sur https://www.parlermoinsvite.fr
2. Créez votre compte gratuit avec mon Code Pro : ${profile.therapist_code}

À très bientôt !`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success("Client email ouvert !");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getDaysSinceLastSession = (dateString: string | null) => {
    if (!dateString) return Infinity;
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusIndicator = (patient: Patient) => {
    const status = patient.retentionStatus;
    if (status === "new") return { color: "bg-blue-500", label: "Nouveau" };
    if (status === "dropout") return { color: "bg-red-500", label: "Abandon" };
    if (status === "slipping") return { color: "bg-orange-500", label: "À risque" };
    return { color: "bg-green-500", label: "Actif" };
  };

  // Format relative time for "last activity"
  const formatRelativeTime = (daysSince: number): { text: string; isNever: boolean } => {
    if (daysSince < 0) return { text: "Pas encore d'exercice", isNever: true };
    if (daysSince === 0) return { text: "Aujourd'hui", isNever: false };
    if (daysSince === 1) return { text: "Hier", isNever: false };
    return { text: `Il y a ${daysSince}j`, isNever: false };
  };

  // Filter patients by archived status and search query
  const filterBySearch = (list: Patient[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(p => 
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.clinical_tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  };
  const activePatients = filterBySearch(patients.filter(p => !p.is_archived));
  const archivedPatients = filterBySearch(patients.filter(p => p.is_archived));
  const activePatientCount = patients.filter(p => !p.is_archived).length;
  const seatsLimit = profile?.seats_limit || 3;
  const isAtSeatLimit = activePatientCount >= seatsLimit;

  // Count patients by risk level (only active ones, exclude "new" patients)
  const dropoutCount = activePatients.filter(p => p.retentionStatus === "dropout").length;
  const slippingCount = activePatients.filter(p => p.retentionStatus === "slipping").length;

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Docteur";
  const fullName = profile?.full_name || firstName;

  // Contextual greeting with variety
  const getGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0=Sun ... 6=Sat
    const variants = hour < 12
      ? ["Bonjour", "Belle matinée", "Bonne matinée"]
      : hour < 18
        ? ["Bon après-midi", "Belle après-midi", "Hey"]
        : ["Bonsoir", "Belle soirée", "Bonne fin de journée"];
    // Pick variant based on day of week for consistency within a day
    return variants[day % variants.length];
  };

  // Contextual subtitle with rotating positive messages
  const getSubtitle = () => {
    if (patients.length === 0) return "Votre espace est prêt, invitez votre premier patient 🚀";
    if (dropoutCount > 0) return `${dropoutCount} patient${dropoutCount > 1 ? 's' : ''} nécessite${dropoutCount > 1 ? 'nt' : ''} votre attention`;
    if (slippingCount > 0) return `${slippingCount} patient${slippingCount > 1 ? 's' : ''} à relancer cette semaine`;
    
    const positiveMessages = [
      `${activePatientCount} patient${activePatientCount > 1 ? 's' : ''} actif${activePatientCount > 1 ? 's' : ''} — tout roule ! 🎯`,
      `${activePatientCount} patient${activePatientCount > 1 ? 's' : ''} en bonne voie — bravo ! ✨`,
      `Tous vos patients sont actifs — excellent travail ! 💪`,
      `${activePatientCount} patient${activePatientCount > 1 ? 's' : ''} motivé${activePatientCount > 1 ? 's' : ''} — belle dynamique ! 🔥`,
      `Vos patients progressent bien — continuez ainsi ! 🌟`,
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return positiveMessages[dayOfYear % positiveMessages.length];
  };

  // Archive/Restore patient
  const handleArchivePatient = async (patientId: string, archive: boolean) => {
    setArchivingPatient(patientId);
    try {
      const { error } = await supabase
        .rpc("archive_patient", { patient_uuid: patientId, should_archive: archive });

      if (error) throw error;

      setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, is_archived: archive } : p
      ));

      toast.success(archive 
        ? "Patient archivé. Un siège s'est libéré." 
        : "Patient restauré avec succès."
      );
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setArchivingPatient(null);
    }
  };

  const handleNudgePatient = async (patientId: string, patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Anti-spam: 48h cooldown per patient
    const lastNudge = nudgedPatients[patientId];
    if (lastNudge && Date.now() - lastNudge < 48 * 60 * 60 * 1000) {
      const hoursLeft = Math.ceil((48 * 60 * 60 * 1000 - (Date.now() - lastNudge)) / (60 * 60 * 1000));
      toast.info(`Rappel déjà envoyé récemment. Prochain envoi possible dans ~${hoursLeft}h.`, {
        description: "💡 Des emails de relance automatiques sont déjà envoyés aux patients inactifs.",
      });
      return;
    }

    setNudgingPatient(patientId);
    try {
      const { data, error } = await supabase.functions.invoke("notify-nudge", {
        body: { patientId, therapistId: user?.id },
      });
      if (error) throw error;
      
      // Track nudge timestamp
      const updated = { ...nudgedPatients, [patientId]: Date.now() };
      setNudgedPatients(updated);
      localStorage.setItem("nudgedPatients", JSON.stringify(updated));
      
      toast.success(`Rappel envoyé à ${patientName || "ce patient"} 📩`, {
        description: "💡 Des relances automatiques sont aussi envoyées aux patients inactifs.",
      });
    } catch (error) {
      console.error("Error sending nudge:", error);
      toast.error("Erreur lors de l'envoi du rappel");
    } finally {
      setNudgingPatient(null);
    }
  };

  // Empty state for onboarding
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            Votre espace pro est prêt ! ✅
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Il ne reste qu'à inviter votre patient. Dès qu'il créera son compte, il apparaîtra automatiquement ici.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">Voici votre Code Pro unique :</p>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                  {profile?.therapist_code || "PRO-XXXXXX"}
                </code>
                <Button onClick={copyInviteCode} size="sm" variant="outline" className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copié !" : "Copier"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ce code est le même pour tous vos patients — partagez-le autant de fois que nécessaire.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">Transmettez ce code à votre patient par email</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={openMailClient} variant="default" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Envoyer par email
                </Button>
                <Button onClick={copyEmailTemplate} variant="outline" className="gap-2">
                  {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {emailCopied ? "Copié !" : "Copier le modèle"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Un email personnalisé expliquant les bénéfices de l'application
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium mb-1">Le patient crée son compte avec votre Code Pro</p>
              <p className="text-sm text-muted-foreground">
                Tout est expliqué dans l'email, il n'aura qu'à suivre les étapes.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium mb-1">C'est tout ! Le patient apparaîtra automatiquement ici</p>
              <p className="text-sm text-muted-foreground">
                Aucune action de votre part : dès qu'il crée son compte, vous verrez ses sessions et ses progrès.
              </p>
            </div>
          </div>

          {/* Débitmètre en séance — CTA principal */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-600" />
              Utilisable dès maintenant, même sans patient inscrit :
            </p>
            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md w-full sm:w-auto mb-3">
              <Link to="/session-live">
                <Gauge className="w-4 h-4" />
                Débitmètre en séance
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Mesurez la vitesse de parole de votre patient en temps réel pendant la séance. Aucun compte patient nécessaire.
            </p>
          </div>

          {/* Parrainage */}
          <ReferralCard />

          {/* En attendant block */}
          <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/30">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-chart-2" />
              Vous pouvez aussi :
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/library">
                  📖 Explorer les exercices
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                  Personnaliser mon profil
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Les séances lancées ici sont en <span className="font-medium">mode découverte</span> (test personnel). Pour enregistrer une séance dans le dossier d'un patient, utilisez le bouton <span className="font-medium">« S'exercer »</span> depuis sa fiche.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Welcome Tour Modal */}
      <WelcomeTourModal 
        open={showWelcomeTour} 
        onClose={() => {
          setShowWelcomeTour(false);
          if (user) {
            supabase
              .from("profiles")
              .update({ onboarding_completed_at: new Date().toISOString() })
              .eq("id", user.id)
              .then();
          }
        }} 
      />

      {/* Expired Overlay - Blocks access when trial expired */}
      {therapistStatus?.isTrialExpired && <ExpiredOverlay />}

    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Trial Banner */}
      {therapistStatus?.isTrialActive && (
        <TrialBanner 
          daysRemaining={therapistStatus.daysRemaining} 
          activePatients={activePatientCount}
          totalSessions={totalSessionCount}
        />
      )}

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/patient/list" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline">ParlerMoinsVite</span>
            <span className="text-xs bg-chart-2/20 text-chart-2 px-2 py-0.5 rounded-full font-medium hidden sm:inline">PRO</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Cabinet de <span className="font-medium text-foreground">{fullName}</span></span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.referral_code && (
              <RecommendButton 
                referralCode={profile.referral_code || ""} 
                therapistName={fullName} 
              />
            )}
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => navigate("/library")}>
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Tester les exercices</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome + inline stats */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">
                {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-muted-foreground">
                {getSubtitle()}
              </p>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate("/assessment/battery")}
                      variant="outline"
                      className="gap-2 whitespace-nowrap"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Nouveau Bilan
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-300">
                        🧪 Bêta
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    <p className="font-medium">Batterie Bredouillement complète</p>
                    <p className="text-xs text-muted-foreground mt-1">Export PDF + Word personnalisable — pas de format bloquant, vous gardez la main sur votre compte-rendu.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                onClick={() => navigate("/session-live")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md whitespace-nowrap"
              >
                <Gauge className="w-4 h-4" />
                Débitmètre en séance
              </Button>
            </div>
          </div>

          {/* Onboarding Checklist - shown when therapist hasn't completed key actions */}
          {!loading && patients.length > 0 && !hasAssignedExercise && (
            <OnboardingChecklist
              hasPatients={patients.length > 0}
              hasAssignedExercise={hasAssignedExercise}
              therapistCode={profile?.therapist_code || null}
            />
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : patients.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Alert Banner for At-Risk Patients - compact */}
              {(dropoutCount > 0 || slippingCount > 0) && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 text-sm ${dropoutCount > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 ${dropoutCount > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                  <span>
                    {dropoutCount > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {dropoutCount} inactif{dropoutCount > 1 ? 's' : ''} (5j+)
                      </span>
                    )}
                    {dropoutCount > 0 && slippingCount > 0 && <span className="mx-1.5 text-muted-foreground">·</span>}
                    {slippingCount > 0 && (
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        {slippingCount} à risque
                      </span>
                    )}
                    <span className="text-muted-foreground ml-2">— pensez à les relancer</span>
                  </span>
                </div>
              )}

              {/* Seat Counter - compact */}
              <div className="mb-4">
                <SeatCounter activePatients={activePatientCount} seatsLimit={seatsLimit} />
              </div>

              {/* Activity Heatmap */}
              {heatmapSessions.length > 0 && (
                <PatientActivityHeatmap
                  patients={heatmapSessions}
                  onPatientClick={(id) => navigate(`/patient/${id}`)}
                />
              )}

              {/* Patients Table with integrated invite */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Patients de {fullName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{activePatientCount} actif{activePatientCount > 1 ? "s" : ""} · {archivedPatients.length} archivé{archivedPatients.length > 1 ? "s" : ""}</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="font-mono text-xs font-medium text-foreground">{profile?.therapist_code || "N/A"}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyInviteCode(); }}>
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                disabled={isAtSeatLimit}
                                onClick={openMailClient}
                              >
                                <UserPlus className="w-4 h-4" />
                                Inviter
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isAtSeatLimit && (
                            <TooltipContent>
                              <p>Limite atteinte. Archivez un patient ou passez au plan supérieur.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archived")}>
                        <TabsList>
                          <TabsTrigger value="active" className="gap-1.5 text-xs">
                            <Users className="w-3.5 h-3.5" />
                            Actifs ({activePatientCount})
                          </TabsTrigger>
                          <TabsTrigger value="archived" className="gap-1.5 text-xs">
                            <Archive className="w-3.5 h-3.5" />
                            Archives ({archivedPatients.length})
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom ou tag (TDAH, Parkinson...)"
                      className="pl-9 h-9"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              Série
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dernière activité</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sessions/sem.</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vitesse moy.</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activeTab === "active" ? activePatients : archivedPatients).map((patient) => {
                          const status = getStatusIndicator(patient);
                          return (
                            <tr 
                              key={patient.id} 
                              className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                                activeTab === "active" && patient.retentionStatus === 'dropout' ? 'bg-red-500/5' : 
                                activeTab === "active" && patient.retentionStatus === 'slipping' ? 'bg-orange-500/5' : ''
                              }`}
                              onClick={() => navigate(`/patient/${patient.id}`)}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${activeTab === "archived" ? 'bg-muted-foreground' : status.color} ${
                                    activeTab === "active" && patient.retentionStatus === 'dropout' ? 'animate-pulse' : ''
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    activeTab === "archived" ? 'text-muted-foreground' :
                                    patient.retentionStatus === 'dropout' ? 'text-red-600' :
                                    patient.retentionStatus === 'slipping' ? 'text-orange-600' : 'text-muted-foreground'
                                  }`}>{activeTab === "archived" ? "Archivé" : status.label}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium">{patient.full_name || "Patient"}</div>
                                {patient.clinical_tags && patient.clinical_tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {patient.clinical_tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="text-[10px] px-1.5 py-0 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                        {tag}
                                      </span>
                                    ))}
                                    {patient.clinical_tags.length > 3 && (
                                      <span className="text-[10px] text-muted-foreground">+{patient.clinical_tags.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <Flame className={`w-4 h-4 ${patient.current_streak > 0 ? 'text-orange-500 fill-orange-500/30' : 'text-muted-foreground/50'}`} />
                                  <span className={`font-bold tabular-nums ${patient.current_streak > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {patient.current_streak}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  const activity = formatRelativeTime(patient.daysSinceActivity);
                                  if (activity.isNever) {
                                    return (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-sm text-amber-600 font-medium cursor-help flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            À relancer
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px]">
                                          <p className="text-xs">Ce patient s'est inscrit mais n'a encore fait aucun exercice. Pensez à le relancer !</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  }
                                  return (
                                    <span className={`text-sm ${
                                      activeTab === "archived" ? 'text-muted-foreground' :
                                      patient.retentionStatus === 'dropout' ? 'text-red-600 font-medium' :
                                      patient.retentionStatus === 'slipping' ? 'text-orange-600' : 'text-muted-foreground'
                                    }`}>
                                      {activity.text}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-4">
                                <span className={patient.sessions_this_week >= 3 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                  {patient.sessions_this_week}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  const sps = patient.avg_wpm ? wpmToSps(patient.avg_wpm) : null;
                                  return (
                                    <span className={`font-medium ${
                                      sps ? (
                                        sps <= 4.0 ? "text-green-600" :
                                        sps <= 5.0 ? "text-yellow-600" : "text-red-600"
                                      ) : "text-muted-foreground"
                                    }`}>
                                      {sps ? `${sps} SPS` : "-"}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/patient/${patient.id}`);
                                    }}
                                    className="gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir
                                  </Button>
                                  {activeTab === "active" && (patient.retentionStatus === "slipping" || patient.retentionStatus === "dropout" || patient.daysSinceActivity < 0) && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={(e) => handleNudgePatient(patient.id, patient.full_name || "Patient", e)}
                                          disabled={nudgingPatient === patient.id}
                                          className={`${nudgedPatients[patient.id] && Date.now() - nudgedPatients[patient.id] < 48 * 60 * 60 * 1000 ? 'text-muted-foreground' : 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'}`}
                                        >
                                          <BellRing className={`w-4 h-4 ${nudgingPatient === patient.id ? 'animate-pulse' : ''}`} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {nudgedPatients[patient.id] && Date.now() - nudgedPatients[patient.id] < 48 * 60 * 60 * 1000
                                          ? "Rappel déjà envoyé (1 max / 48h)"
                                          : "Envoyer un rappel par email"}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {activeTab === "active" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchivePatient(patient.id, true);
                                          }}
                                          disabled={archivingPatient === patient.id}
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          <Archive className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Archiver ce patient</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleArchivePatient(patient.id, false);
                                            }}
                                            disabled={archivingPatient === patient.id || isAtSeatLimit}
                                            className="text-primary hover:text-primary"
                                          >
                                            <RotateCcw className="w-4 h-4" />
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {isAtSeatLimit 
                                          ? "Limite de sièges atteinte" 
                                          : "Restaurer ce patient"
                                        }
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(activeTab === "active" ? activePatients : archivedPatients).length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              {activeTab === "active" 
                                ? "Aucun patient actif" 
                                : "Aucun patient archivé"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Collapsible Referral & Metrics Cards */}
              <div className="mt-8 space-y-4">
                <ReferralCard />
                <MetricsInfoCard />
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
    <WhatsNewModal />
    </>
  );
};

export default TherapistDashboard;
