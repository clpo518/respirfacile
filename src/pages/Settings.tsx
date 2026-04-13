import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Loader2, Save, UserPlus, Check, X, Mail, Headphones, Dna, Info, Clock, CreditCard, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { SPS_TARGET_LEVELS, spsToWpm, wpmToSps } from "@/lib/spsUtils";
import { getNormSPS, getAgeGroupLabel, validateBirthYear } from "@/lib/ageNormsUtils";
import { copyToClipboard } from "@/lib/clipboard";
import { motion } from "framer-motion";
import { toast } from "sonner";

import TherapistMarketingKit from "@/components/settings/TherapistMarketingKit";
import PatientReferralCard from "@/components/referral/PatientReferralCard";

interface Profile {
  full_name: string | null;
  target_wpm: number;
  is_therapist: boolean;
  is_premium: boolean;
  therapist_code: string | null;
  linked_therapist_id: string | null;
  birth_year: number | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
}

interface TherapistInfo {
  full_name: string | null;
  therapist_code: string | null;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkingTherapist, setLinkingTherapist] = useState(false);
  const [therapistCode, setTherapistCode] = useState("");
  const [linkedTherapist, setLinkedTherapist] = useState<TherapistInfo | null>(null);
  const [birthYearInput, setBirthYearInput] = useState("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    target_wpm: 150,
    is_therapist: false,
    is_premium: false,
    therapist_code: null,
    linked_therapist_id: null,
    birth_year: null,
    trial_start_date: null,
    trial_end_date: null,
    subscription_plan: null,
    subscription_status: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, target_wpm, is_therapist, is_premium, therapist_code, linked_therapist_id, birth_year, trial_start_date, trial_end_date, subscription_plan, subscription_status")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Erreur lors du chargement du profil");
      } else if (data) {
        setProfile(data);
        if (data.birth_year) {
          setBirthYearInput(data.birth_year.toString());
        }
        
        // Fetch linked therapist info if exists (via SECURITY DEFINER RPC to avoid RLS issues)
        if (data.linked_therapist_id) {
          const { data: therapistResults, error: therapistError } = await supabase
            .rpc("get_linked_therapist_info");

          if (therapistError) {
            console.error("Error fetching linked therapist:", therapistError);
          }

          const therapistData = therapistResults?.[0];
          if (therapistData) {
            setLinkedTherapist(therapistData);
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);


  const handleLinkTherapist = async () => {
    if (!user || !therapistCode.trim()) return;
    setLinkingTherapist(true);

    try {
      // Use security definer function to find therapist by code (bypasses RLS)
      const { data: therapistResults, error: findError } = await supabase
        .rpc("find_therapist_by_code", { code: therapistCode.trim() });

      const therapist = therapistResults?.[0];

      if (findError) throw findError;

      if (!therapist) {
        toast.error("Code orthophoniste invalide");
        setLinkingTherapist(false);
        return;
      }

      // Update patient's profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: therapist.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, linked_therapist_id: therapist.id }));
      setLinkedTherapist({ full_name: therapist.full_name, therapist_code: therapist.therapist_code });
      setTherapistCode("");
      toast.success(`Vous êtes maintenant suivi par ${therapist.full_name || "votre orthophoniste"}`);

      // Notify therapist that a new patient joined (fire and forget)
      supabase.functions.invoke('notify-patient-joined', {
        body: {
          patientId: user.id,
          therapistId: therapist.id,
        },
      }).then((result) => {
        if (result.error) {
          console.error('Failed to notify therapist:', result.error);
        } else {
          console.log('Therapist notified of new patient');
        }
      }).catch((err) => {
        console.error('Error calling notify-patient-joined:', err);
      });
    } catch (error) {
      console.error("Error linking therapist:", error);
      toast.error("Erreur lors de la liaison");
    } finally {
      setLinkingTherapist(false);
    }
  };

  const handleUnlinkTherapist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: null })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, linked_therapist_id: null }));
      setLinkedTherapist(null);
      toast.success("Lien avec l'orthophoniste supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBirthYearChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setBirthYearInput(numericValue);
    
    if (numericValue.length === 4) {
      const year = parseInt(numericValue, 10);
      const validation = validateBirthYear(year);
      if (validation.valid) {
        setProfile(prev => ({ ...prev, birth_year: year }));
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Validate birth year if provided
      let birthYearToSave = profile.birth_year;
      if (birthYearInput.length === 4) {
        const year = parseInt(birthYearInput, 10);
        const validation = validateBirthYear(year);
        if (validation.valid) {
          birthYearToSave = year;
        }
      }

      // Note: is_therapist is now fixed at signup and cannot be changed
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          target_wpm: profile.target_wpm,
          birth_year: birthYearToSave,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, birth_year: birthYearToSave }));
      toast.success("Profil mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Paramètres</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-display font-bold">Paramètres du compte</h1>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Birth Year Field - Only for patients */}
              {!profile.is_therapist && (
                <div className="space-y-2">
                  <Label htmlFor="birth-year" className="flex items-center gap-2">
                    <Dna className="w-4 h-4 text-primary" />
                    Année de naissance
                  </Label>
                  <div className="flex gap-3 items-start">
                    <Input
                      id="birth-year"
                      type="text"
                      inputMode="numeric"
                      placeholder="ex: 1985"
                      value={birthYearInput}
                      onChange={(e) => handleBirthYearChange(e.target.value)}
                      className="w-32 font-mono"
                      maxLength={4}
                    />
                    {profile.birth_year && (
                      <div className="flex-1 p-2 rounded-lg bg-muted border border-border">
                        <p className="text-xs text-muted-foreground">Norme de référence (Van Zaalen)</p>
                        <p className="font-semibold text-foreground">
                          {getNormSPS(profile.birth_year)} syll/sec 
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            ({getAgeGroupLabel(profile.birth_year)})
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          À titre indicatif — choisissez un objectif adapté ci-dessous
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    La norme est une référence statistique, pas un objectif obligatoire. Votre orthophoniste peut vous conseiller un objectif personnalisé.
                  </p>
                </div>
              )}

              {/* Speed Target - Only for patients */}
              {!profile.is_therapist && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Objectif de vitesse
                  </Label>
                  
                  {/* Custom SPS input */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={wpmToSps(profile.target_wpm).toFixed(1)}
                        onChange={(e) => {
                          const customSps = parseFloat(e.target.value);
                          if (!isNaN(customSps) && customSps >= 1 && customSps <= 10) {
                            setProfile({ ...profile, target_wpm: spsToWpm(customSps) });
                          }
                        }}
                        className="w-24 font-mono text-center font-bold"
                      />
                      <span className="text-sm text-muted-foreground">syll/sec</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">
                      💡 Votre orthophoniste conseille souvent : vitesse habituelle − 1 syll/s
                    </p>
                  </div>
                  
                  {/* Quick preset buttons */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Ou choisir un niveau :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SPS_TARGET_LEVELS.map((level) => {
                        const levelWpm = spsToWpm(level.sps);
                        const isSelected = Math.abs(profile.target_wpm - levelWpm) < 15;
                        const userNorm = profile.birth_year ? getNormSPS(profile.birth_year) : null;
                        const isUserNorm = userNorm && Math.abs(level.sps - userNorm) < 0.5;
                        return (
                          <button
                            key={level.level}
                            type="button"
                            onClick={() => setProfile({ ...profile, target_wpm: levelWpm })}
                            className={`px-3 py-1.5 rounded-lg border text-center transition-all text-sm ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary/20 font-semibold"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <span className="font-bold">{level.sps}</span>
                            <span className="text-muted-foreground ml-1 text-xs">{level.label}</span>
                            {isUserNorm && (
                              <span className="ml-1 text-[9px] bg-muted text-muted-foreground px-1 py-0.5 rounded">
                                norme
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Cet objectif sera utilisé pour le feedback en temps réel pendant vos exercices
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Therapist Card (Only for non-therapists) */}
          {!profile.is_therapist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Mon Orthophoniste
                </CardTitle>
                <CardDescription>
                  Liez votre compte à votre orthophoniste pour qu'il puisse suivre vos progrès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.linked_therapist_id ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Suivi par :</p>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                          {linkedTherapist?.full_name || "Votre orthophoniste"}
                        </p>
                        {!!linkedTherapist?.therapist_code && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Code : {linkedTherapist.therapist_code}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleUnlinkTherapist}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Dissocier
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground mb-3">
                        Entrez le code fourni par votre orthophoniste :
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="PRO-XXXXXX"
                          value={therapistCode}
                          onChange={(e) => setTherapistCode(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                        <Button 
                          onClick={handleLinkTherapist} 
                          disabled={linkingTherapist || !therapistCode.trim()}
                        >
                          {linkingTherapist ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Therapist Pro Code Card - High Visibility for Therapists */}
          {profile.is_therapist && profile.therapist_code && (
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-chart-2/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <span className="text-2xl">🔑</span>
                  Votre Code Praticien
                </CardTitle>
                <CardDescription>
                  Transmettez ce code à vos patients pour qu'ils l'ajoutent dans leur espace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="flex-1 text-3xl font-mono font-bold text-primary bg-primary/10 px-6 py-4 rounded-xl text-center tracking-widest">
                    {profile.therapist_code}
                  </code>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 shrink-0"
                    onClick={async () => {
                      if (profile.therapist_code) {
                        const success = await copyToClipboard(profile.therapist_code);
                        if (success) {
                          toast.success("Code copié !");
                        } else {
                          toast.error("Erreur lors de la copie");
                        }
                      }
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Copier
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  👉 Vos patients doivent entrer ce code à l'inscription lors de la création de leur compte.
                  Vous verrez ensuite leurs résultats dans votre tableau de bord.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Invite Patients Card - Only for therapists */}
          {profile.is_therapist && profile.therapist_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Inviter vos patients
                </CardTitle>
                <CardDescription>
                  Envoyez un email pré-rédigé expliquant la plateforme et votre Code Pro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => {
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
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir Mail
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={async () => {
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
                        toast.success("Modèle d'email copié !");
                      } else {
                        toast.error("Erreur lors de la copie");
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copier le modèle d'email
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  L'email contient votre Code Pro et guide le patient pas à pas pour créer son compte.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Role display - informational only (no toggle) */}
          {profile.is_therapist && (
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <span className="text-xl">🩺</span>
                  Compte Orthophoniste
                </CardTitle>
                <CardDescription>
                  Votre compte est configuré en tant que professionnel
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Subscription Status Card - Only for therapists */}
          {profile.is_therapist && (() => {
            const trialEndDate = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
            const trialStartDate = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
            const now = new Date();
            const fallbackDaysSinceStart = trialStartDate
              ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            const daysRemaining = trialEndDate
              ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
              : trialStartDate
                ? Math.max(0, 30 - fallbackDaysSinceStart)
                : 30;
            const isTrialExpired = trialEndDate
              ? trialEndDate <= now
              : trialStartDate
                ? fallbackDaysSinceStart >= 30
                : false;
            const isSubscriptionActive = profile.subscription_status === 'active' || profile.is_premium;
            const isOnTrial = profile.subscription_plan === 'trial' && !isTrialExpired;

            if (isSubscriptionActive) {
              return (
                <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CreditCard className="w-5 h-5" />
                      Abonnement actif
                    </CardTitle>
                    <CardDescription>
                      Votre abonnement est actif. Merci pour votre confiance !
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/pro/subscription/manage")}
                      className="w-full"
                    >
                      Gérer mon abonnement
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            if (isOnTrial) {
              return (
                <Card className={`border-2 ${daysRemaining <= 7 ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center gap-2 ${daysRemaining <= 7 ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
                      <Clock className="w-5 h-5" />
                      Période d'essai
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {daysRemaining <= 7 ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} d'essai
                        </span>
                      ) : (
                        <span>Il vous reste <strong className="text-foreground">{daysRemaining} jours</strong> d'essai gratuit</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${daysRemaining <= 7 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${((30 - daysRemaining) / 30) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      À la fin de votre essai, vos patients perdront l'accès à leurs exercices et vous ne pourrez plus consulter leurs données.
                    </p>
                    <Button 
                      onClick={() => navigate("/pro/subscribe")}
                      className="w-full gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      S'abonner maintenant
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            if (isTrialExpired && !isSubscriptionActive) {
              return (
                <Card className="border-2 border-red-400 bg-red-50/50 dark:bg-red-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-5 h-5" />
                      Essai expiré
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                      Votre période d'essai est terminée
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Vos patients n'ont plus accès à leurs exercices. Réactivez votre compte pour restaurer l'accès.
                    </p>
                    <Button 
                      onClick={() => navigate("/pro/subscribe")}
                      className="w-full gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      Réactiver mon compte
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            return null;
          })()}

          {/* Marketing Kit - Only for therapists */}
          {profile.is_therapist && (
            <TherapistMarketingKit />
          )}

          {/* Referral Card for solo patients */}
          {!profile.is_therapist && !profile.linked_therapist_id && (
            <PatientReferralCard />
          )}

          {/* Subscription management for solo B2C patients */}
          {!profile.is_therapist && !profile.linked_therapist_id && (profile.subscription_status === 'active' || profile.subscription_plan === 'b2c') && (
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CreditCard className="w-5 h-5" />
                  Abonnement Patient Autonome
                </CardTitle>
                <CardDescription>
                  Votre abonnement est actif — 9€/mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/subscription/manage")}
                  className="w-full"
                >
                  Gérer mon abonnement
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Support Card - Simplified for B2B model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Support
              </CardTitle>
              <CardDescription>
                Besoin d'aide ? Contactez notre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Une question ? Notre équipe est là pour vous aider.
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <code className="text-sm font-medium flex-1">contact@parlermoinsvite.fr</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="shrink-0"
                    onClick={async () => {
                      const success = await copyToClipboard("contact@parlermoinsvite.fr");
                      if (success) {
                        toast.success("Email copié !");
                      } else {
                        toast.error("Erreur lors de la copie");
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1">
              Se déconnecter
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
