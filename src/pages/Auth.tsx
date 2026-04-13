import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ArrowLeft, Loader2, User, Stethoscope, KeyRound, Zap, ArrowRight, Clock, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { checkEmailDomainTypo, type EmailSuggestion } from "@/lib/emailValidation";
import { trackFunnel } from "@/lib/analytics";

type UserRole = "patient" | "therapist";
type PatientMode = "choose" | "code" | "solo";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const referralCode = searchParams.get("ref");
  const [isLogin, setIsLogin] = useState(initialTab !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [therapistCode, setTherapistCode] = useState("");
  const [therapistCodeError, setTherapistCodeError] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [patientMode, setPatientMode] = useState<PatientMode>("choose");
  const [emailSuggestion, setEmailSuggestion] = useState<EmailSuggestion | null>(null);
  const [bypassSuggestion, setBypassSuggestion] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Reset patient mode when switching tabs
  useEffect(() => {
    setPatientMode("choose");
    setTherapistCode("");
    setTherapistCodeError("");
  }, [selectedRole, isLogin]);

  // Validate therapist code format
  const validateTherapistCodeFormat = (code: string): boolean => {
    return /^PRO-[A-Z0-9]{6}$/i.test(code.trim());
  };

  // Verify therapist code exists in database
  const verifyTherapistCode = async (code: string): Promise<{ valid: boolean; therapistId: string | null }> => {
    try {
      const { data, error } = await supabase
        .rpc("find_therapist_by_code", { code: code.trim() });
      
      if (error) throw error;
      
      const therapist = data?.[0];
      return {
        valid: !!therapist,
        therapistId: therapist?.id || null
      };
    } catch (error) {
      console.error("Error verifying therapist code:", error);
      return { valid: false, therapistId: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTherapistCodeError("");

    // Email domain typo check (only on signup, skip if user already bypassed)
    if (!isLogin && !bypassSuggestion) {
      const suggestion = checkEmailDomainTypo(email);
      if (suggestion.hasSuggestion) {
        setEmailSuggestion(suggestion);
        setLoading(false);
        return;
      }
    }
    setEmailSuggestion(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        trackFunnel("login_success");
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      } else {
        // Patient signup
        if (selectedRole === "patient") {
          if (patientMode === "code") {
            // B2B flow: validate code
            if (!therapistCode.trim()) {
              setTherapistCodeError("Le code praticien est obligatoire");
              setLoading(false);
              return;
            }

            if (!validateTherapistCodeFormat(therapistCode)) {
              setTherapistCodeError("Format invalide (ex: PRO-ABC123)");
              setLoading(false);
              return;
            }

            setValidatingCode(true);
            const { valid, therapistId } = await verifyTherapistCode(therapistCode);
            setValidatingCode(false);

            if (!valid || !therapistId) {
              setTherapistCodeError("Code praticien invalide ou inexistant");
              setLoading(false);
              return;
            }

            // B2B signup
            const { error } = await signUp(email, password, name, false, false);
            if (error) throw error;
            trackFunnel("signup_patient_b2b");

            // Link patient to therapist
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase
                .from("profiles")
                .update({ linked_therapist_id: therapistId })
                .eq("id", newUser.id);

              // Notify therapist that a new patient joined (fire and forget)
              supabase.functions.invoke('notify-patient-joined', {
                body: {
                  patientId: newUser.id,
                  therapistId: therapistId,
                },
              }).catch((err) => {
                console.error('Error calling notify-patient-joined:', err);
              });
            }

            toast.success("Compte créé avec succès ! Vous êtes maintenant lié à votre orthophoniste.");
            navigate("/dashboard");
          } else if (patientMode === "solo") {
            // B2C solo signup - trial starts only after email verification
            const { error } = await signUp(email, password, name, false, true);
            if (error) throw error;
            trackFunnel("signup_patient_b2c");

            // Handle B2C referral if present
            if (referralCode) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: { user: newUser } } = await supabase.auth.getUser();
              if (newUser) {
                const { data: referrerProfile } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("referral_code", referralCode.toUpperCase())
                  .maybeSingle();
                
                if (referrerProfile) {
                  await supabase
                    .from("referrals")
                    .insert({
                      referrer_id: referrerProfile.id,
                      referred_id: newUser.id,
                      status: "pending"
                    });
                }
              }
            }

            // Send verification email
            await supabase.auth.resend({ type: 'signup', email });

            // Show verification screen instead of navigating
            setVerificationEmail(email);
            setEmailVerificationSent(true);
            setLoading(false);
            return; // Don't navigate, show verification screen
          }
        } else {
          // Therapist signup
          const { error } = await signUp(email, password, cabinetName, true);
          if (error) throw error;
          trackFunnel("signup_therapist");

          // Handle referral if present
          if (referralCode) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              const { data: referrerProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("referral_code", referralCode.toUpperCase())
                .maybeSingle();
              
              if (referrerProfile) {
                await supabase
                  .from("referrals")
                  .insert({
                    referrer_id: referrerProfile.id,
                    referred_id: newUser.id,
                    status: "pending"
                  });
                
                toast.success("Espace Pro créé ! 🎁 Votre parrain et vous recevrez 1 mois offert après votre premier paiement.");
              } else {
                toast.success("Espace Pro créé avec succès !");
              }
            }
          } else {
            toast.success("Espace Pro créé avec succès !");
          }
          
          navigate("/patient/list");
        }
      }
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      
      // Provide clearer French error messages for login
      if (isLogin) {
        const lower = rawMessage.toLowerCase();
        if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
          toast.error("Email ou mot de passe incorrect. Pas encore de compte ? Cliquez sur « Inscription ».");
        } else if (lower.includes("email not confirmed")) {
          toast.error("Votre email n'a pas encore été vérifié. Vérifiez votre boîte de réception.");
        } else {
          toast.error(rawMessage);
        }
      } else {
        // Signup errors
        const lower = rawMessage.toLowerCase();
        if (lower.includes("user already registered") || lower.includes("already been registered")) {
          toast.error("Un compte existe déjà avec cet email. Essayez de vous connecter.");
        } else {
          toast.error(rawMessage);
        }
      }
    } finally {
      setLoading(false);
      setValidatingCode(false);
    }
  };

  // Check if form can be submitted
  const canSubmit = () => {
    if (isLogin) return true;
    if (selectedRole === "therapist") return true;
    // Patient must choose a mode
    return patientMode !== "choose";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Retour à l'accueil
        </Link>
        
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="text-center pb-2">
            {!emailVerificationSent && (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                selectedRole === "therapist" && !isLogin 
                  ? "bg-purple-600" 
                  : "bg-primary"
              }`}>
                {selectedRole === "therapist" && !isLogin ? (
                  <Stethoscope className="w-8 h-8 text-white" />
                ) : (
                  <Activity className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
            )}
            {!emailVerificationSent && (
              <>
                <CardTitle className="text-2xl">
                  {forgotPassword 
                    ? "Réinitialiser le mot de passe"
                    : isLogin ? "Bon retour !" : "Créer un compte"}
                </CardTitle>
                <CardDescription>
                  {forgotPassword
                    ? "Recevez un lien par email pour créer un nouveau mot de passe"
                    : isLogin 
                      ? "Patient ou Orthophoniste, c'est le même accès" 
                      : selectedRole === "patient"
                        ? patientMode === "solo"
                          ? "Commencez avec 7 jours d'essai gratuit"
                          : "Commencez votre parcours vers une meilleure élocution"
                        : "Créez votre espace de suivi professionnel"
                  }
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="max-h-[70vh] overflow-y-auto">
            {/* Email Verification Sent Screen (Solo only) */}
            {emailVerificationSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Vérifiez votre email</h3>
                <p className="text-sm text-muted-foreground">
                  Un email de vérification a été envoyé à{" "}
                  <strong className="text-foreground">{verificationEmail}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur le lien dans l'email pour activer votre essai gratuit de 7 jours.
                </p>

                <div className="pt-2 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={resendingVerification}
                    onClick={async () => {
                      setResendingVerification(true);
                      try {
                        const { error } = await supabase.auth.resend({ type: 'signup', email: verificationEmail });
                        if (error) throw error;
                        toast.success("Email renvoyé ! Vérifiez votre boîte de réception.");
                      } catch {
                        toast.error("Impossible de renvoyer l'email. Réessayez dans quelques instants.");
                      } finally {
                        setResendingVerification(false);
                      }
                    }}
                  >
                    {resendingVerification ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Renvoyer l'email
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerificationSent(false);
                      setIsLogin(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </motion.div>
            )}
            {/* Role Selection Tabs (only for signup) */}
            {!isLogin && !forgotPassword && !emailVerificationSent && (
              <Tabs 
                value={selectedRole} 
                onValueChange={(v) => setSelectedRole(v as UserRole)}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient" className="gap-2">
                    <User className="w-4 h-4" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger value="therapist" className="gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Orthophoniste
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Patient Mode Selector (only for patient signup) */}
            {!isLogin && !forgotPassword && !emailVerificationSent && selectedRole === "patient" && patientMode === "choose" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mb-6"
              >
                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
                  Comment souhaitez-vous vous inscrire ?
                </p>
                
                {/* Option A: With Pro Code (B2B) */}
                <button
                  type="button"
                  onClick={() => setPatientMode("code")}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <KeyRound className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">J'ai un Code Pro</h3>
                      <p className="text-xs text-muted-foreground">
                        Mon orthophoniste m'a donné un code (PRO-XXXXXX) pour me lier à son suivi
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </button>

                {/* Option B: Solo (B2C) */}
                <button
                  type="button"
                  onClick={() => setPatientMode("solo")}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">M'inscrire seul</h3>
                      <p className="text-xs text-muted-foreground">
                        Essai gratuit de 7 jours, puis abonnement individuel
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* Registration Form (shown when mode is chosen or for login/therapist) */}
            {!forgotPassword && !emailVerificationSent && (isLogin || selectedRole === "therapist" || patientMode !== "choose") && (
              <motion.div
                initial={!isLogin && selectedRole === "patient" ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Back button to mode chooser */}
                {!isLogin && selectedRole === "patient" && patientMode !== "choose" && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode("choose");
                      setTherapistCode("");
                      setTherapistCodeError("");
                    }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Changer de mode
                  </button>
                )}

                {/* Solo trial badge */}
                {!isLogin && selectedRole === "patient" && patientMode === "solo" && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Essai gratuit — 7 jours d'accès complet
                      </span>
                    </div>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 ml-6">
                      Vous pourrez rattacher un orthophoniste plus tard dans les Réglages
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {selectedRole === "therapist" ? "Nom du cabinet / Praticien" : "Nom complet"}
                      </Label>
                      {selectedRole === "patient" ? (
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="Jean Dupont" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required={!isLogin && selectedRole === "patient"} 
                          className="h-12 rounded-xl" 
                        />
                      ) : (
                        <Input 
                          id="cabinet" 
                          type="text" 
                          placeholder="Cabinet Orthophonie Martin" 
                          value={cabinetName} 
                          onChange={(e) => setCabinetName(e.target.value)} 
                          required={!isLogin && selectedRole === "therapist"} 
                          className="h-12 rounded-xl" 
                        />
                      )}
                    </div>
                  )}

                  {/* Therapist Code Field - Only for Patient signup with code mode */}
                  {!isLogin && selectedRole === "patient" && patientMode === "code" && (
                    <div className="space-y-2">
                      <Label htmlFor="therapist-code" className="flex items-center gap-2">
                        🔑 Code Praticien
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="therapist-code" 
                        type="text" 
                        placeholder="PRO-XXXXXX" 
                        value={therapistCode} 
                        onChange={(e) => {
                          setTherapistCode(e.target.value.toUpperCase());
                          setTherapistCodeError("");
                        }} 
                        required
                        className={`h-12 rounded-xl font-mono ${therapistCodeError ? 'border-destructive' : ''}`}
                      />
                      {therapistCodeError && (
                        <p className="text-sm text-destructive">{therapistCodeError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Donné par votre orthophoniste pour activer votre suivi
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="jean@example.com" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailSuggestion(null);
                        setBypassSuggestion(false);
                      }} 
                      required 
                      className="h-12 rounded-xl" 
                    />
                    {emailSuggestion?.hasSuggestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                          <div className="flex-1 text-sm">
                            <p className="text-amber-800 dark:text-amber-200">
                              Vouliez-vous dire <strong>{emailSuggestion.suggestedDomain}</strong> ?
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEmail(emailSuggestion.suggestedEmail);
                                  setEmailSuggestion(null);
                                  setBypassSuggestion(false);
                                }}
                              >
                                Corriger
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEmailSuggestion(null);
                                  setBypassSuggestion(true);
                                }}
                              >
                                Continuer quand même
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      minLength={6} 
                      className="h-12 rounded-xl" 
                    />
                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit" 
                    className={`w-full h-12 rounded-xl text-base transition-colors ${
                      selectedRole === "therapist" && !isLogin 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    }`}
                    disabled={loading || validatingCode || !canSubmit()}
                  >
                    {loading || validatingCode ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isLogin ? (
                      "Accéder à mon suivi"
                    ) : selectedRole === "patient" ? (
                      patientMode === "solo" ? "Démarrer mon essai gratuit" : "Créer mon espace patient"
                    ) : (
                      "Créer mon espace Pro"
                    )}
                  </Button>

                  {/* Security reassurance */}
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🔒 Données de santé sécurisées & confidentielles
                  </p>
                </form>
              </motion.div>
            )}
            
            {/* Therapist benefits hint */}
            {!isLogin && !emailVerificationSent && selectedRole === "therapist" && (
              <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
                  ✨ Recevez votre <strong>Code Praticien unique</strong> pour lier vos patients et suivre leurs progrès à distance.
                </p>
              </div>
            )}
            
            {/* Forgot Password Form */}
            {forgotPassword && !emailVerificationSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => { setForgotPassword(false); setResetEmailSent(false); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Retour à la connexion
                </button>

                {resetEmailSent ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">Email envoyé !</h3>
                    <p className="text-sm text-muted-foreground">
                      Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/reset-password`,
                      });
                      if (error) throw error;
                      setResetEmailSent(true);
                    } catch (error: unknown) {
                      const message = error instanceof Error ? error.message : "Une erreur est survenue";
                      toast.error(message);
                    } finally {
                      setLoading(false);
                    }
                  }} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="jean@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien"}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}

            {!emailVerificationSent && (
              <div className="mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setForgotPassword(false); setResetEmailSent(false); }} 
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
