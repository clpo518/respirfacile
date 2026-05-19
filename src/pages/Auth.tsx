import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useAuth, type UserRole } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wind, Stethoscope, User, ArrowRight, ArrowLeft, KeyRound, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

type AuthMode = "login" | "signup"
type SignupStep = "role" | "patient_mode" | "form"
type PatientMode = "code" | "solo"

const Auth = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn, signUp, user } = useAuth()

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  )
  const [step, setStep] = useState<SignupStep>("role")
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient")
  const [patientMode, setPatientMode] = useState<PatientMode>("code")

  const [email, setEmail]                 = useState("")
  const [password, setPassword]           = useState("")
  const [name, setName]                   = useState("")
  const [therapistCode, setTherapistCode] = useState("")
  const [codeError, setCodeError]         = useState("")

  const [loading, setLoading]             = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetSent, setResetSent]         = useState(false)
  const [verifSent, setVerifSent]         = useState(false)
  const [verifEmail, setVerifEmail]       = useState("")

  useEffect(() => {
    if (user) navigate("/dashboard")
  }, [user, navigate])

  useEffect(() => {
    setStep("role")
    setTherapistCode("")
    setCodeError("")
  }, [mode])

  const isValidCodeFormat = (code: string) =>
    /^PRO-[A-Z0-9]{6}$/i.test(code.trim())

  const verifyCode = async (code: string): Promise<{ valid: boolean; therapistId: string | null }> => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("therapist_code", code.trim().toUpperCase())
        .in("role", ["therapist", "kine"])
        .maybeSingle()
      return { valid: !!data, therapistId: data?.id ?? null }
    } catch {
      return { valid: false, therapistId: null }
    }
  }

  // Lit la valeur depuis le state React ou, en fallback, depuis le DOM (utile pour les tests automatisés)
  const readField = (stateVal: string, id: string) => {
    if (stateVal.trim()) return stateVal
    return (document.getElementById(id) as HTMLInputElement)?.value ?? ""
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const effectiveEmail    = readField(email, "auth-email")
    const effectivePassword = readField(password, "auth-password")
    try {
      const { error } = await signIn(effectiveEmail, effectivePassword)
      if (error) throw error
      toast.success("Connexion réussie !")
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      toast.error(msg.includes("Invalid login") ? "Email ou mot de passe incorrect" : "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCodeError("")
    const effectiveEmail    = readField(email, "auth-email")
    const effectivePassword = readField(password, "auth-password")
    const effectiveName     = readField(name, "auth-name")
    const effectiveCode     = readField(therapistCode, "auth-code")
    try {
      let linkedTherapistCode: string | undefined
      if (selectedRole === "patient" && patientMode === "code") {
        if (!effectiveCode.trim()) { setCodeError("Code obligatoire"); setLoading(false); return }
        if (!isValidCodeFormat(effectiveCode)) { setCodeError("Format invalide — ex: PRO-A3K9Z2"); setLoading(false); return }
        const { valid } = await verifyCode(effectiveCode)
        if (!valid) { setCodeError("Code introuvable. Vérifiez avec votre praticien."); setLoading(false); return }
        linkedTherapistCode = effectiveCode.trim().toUpperCase()
      }

      const effectiveRole: UserRole =
        selectedRole === "patient" && patientMode === "solo" ? "solo_patient" : selectedRole

      const { error } = await signUp({ email: effectiveEmail, password: effectivePassword, fullName: effectiveName, role: effectiveRole, therapistCode: linkedTherapistCode })
      if (error) throw error
      setVerifEmail(effectiveEmail)
      setVerifSent(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      toast.error(msg.includes("already registered") ? "Un compte existe déjà avec cet email" : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setResetSent(true)
    } catch {
      toast.error("Impossible d'envoyer l'email de réinitialisation")
    } finally {
      setLoading(false)
    }
  }

  // ── Écrans secondaires ─────────────────────

  if (verifSent) return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl">Vérifiez vos emails</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Un lien de confirmation a été envoyé à<br />
          <span className="font-medium text-foreground">{verifEmail}</span>
        </p>
        <p className="text-xs text-muted-foreground">Vérifiez vos spams si besoin.</p>
        <button onClick={() => { setVerifSent(false); setMode("login") }} className="text-sm text-primary hover:underline">
          Retour à la connexion
        </button>
      </motion.div>
    </AuthShell>
  )

  if (resetSent) return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl">Email envoyé</h2>
        <p className="text-sm text-muted-foreground">Consultez votre boîte mail pour réinitialiser votre mot de passe.</p>
        <button onClick={() => { setResetSent(false); setForgotPassword(false) }} className="text-sm text-primary hover:underline">
          Retour à la connexion
        </button>
      </motion.div>
    </AuthShell>
  )

  if (forgotPassword) return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <button onClick={() => setForgotPassword(false)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div>
          <h2 className="font-display text-2xl mb-1">Mot de passe oublié</h2>
          <p className="text-sm text-muted-foreground">On vous envoie un lien de réinitialisation.</p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.fr" />
          </div>
          <Button type="submit" className="w-full btn-forest" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le lien"}
          </Button>
        </form>
      </motion.div>
    </AuthShell>
  )

  // ── Login ──────────────────────────────────

  if (mode === "login") return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="font-display text-2xl mb-1">Bonjour 👋</h2>
          <p className="text-sm text-muted-foreground">Connectez-vous à votre espace respirfacile.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.fr" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Mot de passe</Label>
              <button type="button" onClick={() => setForgotPassword(true)} className="text-xs text-muted-foreground hover:text-primary">Oublié ?</button>
            </div>
            <Input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full btn-forest" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">S'inscrire</button>
        </p>
      </motion.div>
    </AuthShell>
  )

  // ── Signup étape 1 : rôle ──────────────────

  if (step === "role") return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="font-display text-2xl mb-1">Créer un compte</h2>
          <p className="text-sm text-muted-foreground">Je suis…</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard icon={<User className="w-5 h-5" />} title="Patient" description="Je fais des exercices de respiration" selected={selectedRole === "patient"} onClick={() => setSelectedRole("patient")} />
          <RoleCard icon={<Stethoscope className="w-5 h-5" />} title="Praticien" description="Orthophoniste ou kiné" selected={selectedRole === "therapist"} onClick={() => setSelectedRole("therapist")} />
        </div>
        <Button className="w-full btn-forest" onClick={() => { if (selectedRole === "patient") setStep("patient_mode"); else setStep("form") }}>
          Continuer <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Se connecter</button>
        </p>
      </motion.div>
    </AuthShell>
  )

  // ── Signup étape 2 : mode patient ──────────

  if (step === "patient_mode") return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <button onClick={() => setStep("role")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div>
          <h2 className="font-display text-2xl mb-1">Comment accédez-vous ?</h2>
          <p className="text-sm text-muted-foreground">Votre praticien vous a-t-il donné un code ?</p>
        </div>
        <div className="space-y-3">
          <RoleCard icon={<KeyRound className="w-5 h-5" />} title="J'ai un code praticien" description="Mon orthophoniste / kiné m'a donné un code PRO-XXXXXX" selected={patientMode === "code"} onClick={() => setPatientMode("code")} full />
          <RoleCard icon={<User className="w-5 h-5" />} title="Je m'inscris seul" description="7 jours d'essai gratuit en autonomie" selected={patientMode === "solo"} onClick={() => setPatientMode("solo")} full />
        </div>
        <Button className="w-full btn-forest" onClick={() => setStep("form")}>
          Continuer <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </AuthShell>
  )

  // ── Signup étape 3 : formulaire ────────────

  const isTherapist = selectedRole === "therapist"
  const isPatientWithCode = selectedRole === "patient" && patientMode === "code"

  return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <button onClick={() => setStep(isTherapist ? "role" : "patient_mode")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div>
          <h2 className="font-display text-2xl mb-1">{isTherapist ? "Votre espace praticien" : "Votre compte patient"}</h2>
          <p className="text-sm text-muted-foreground">
            {isTherapist ? "30 jours d'essai gratuit, sans carte bancaire." : patientMode === "solo" ? "7 jours d'essai gratuit." : "Accès offert par votre praticien."}
          </p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{isTherapist ? "Prénom et nom" : "Prénom"}</Label>
            <Input id="auth-name" value={name} onChange={e => setName(e.target.value)} required placeholder={isTherapist ? "Sophie Martin" : "Sophie"} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.fr" />
          </div>
          <div className="space-y-1.5">
            <Label>Mot de passe</Label>
            <Input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={8} />
            <p className="text-xs text-muted-foreground">8 caractères minimum</p>
          </div>
          {isPatientWithCode && (
            <div className="space-y-1.5">
              <Label>Code praticien</Label>
              <Input
                id="auth-code"
                value={therapistCode}
                onChange={e => { setTherapistCode(e.target.value.toUpperCase()); setCodeError("") }}
                placeholder="PRO-A3K9Z2"
                className={codeError ? "border-destructive" : ""}
              />
              {codeError && <p className="text-xs text-destructive">{codeError}</p>}
            </div>
          )}
          <Button type="submit" className="w-full btn-forest" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isTherapist ? "Démarrer l'essai gratuit" : "Créer mon compte"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            En créant un compte, vous acceptez nos{" "}
            <Link to="/legal/terms" className="underline hover:text-foreground">CGU</Link>{" "}
            et notre <Link to="/legal/privacy" className="underline hover:text-foreground">politique de confidentialité</Link>.
          </p>
        </form>
      </motion.div>
    </AuthShell>
  )
}

// ── Shell ──────────────────────────────────────

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-organic flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-forest">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl text-foreground font-semibold">respirfacile</span>
        </div>

        {/* Card */}
        <div className="card-rf p-6">{children}</div>

        {/* Social proof */}
        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground/60">250+</span> patients actifs
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground/60">40+</span> orthophonistes
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="text-forest font-medium">Données hébergées en France</span>
        </div>
      </div>
    </div>
  )
}

// ── RoleCard ───────────────────────────────────

interface RoleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
  full?: boolean
}

function RoleCard({ icon, title, description, selected, onClick, full }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${full ? "w-full flex items-start gap-3 text-left" : "flex flex-col items-start gap-2"}
        p-4 rounded-xl border-2 transition-all duration-200
        ${selected ? "border-primary bg-primary/6 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}
      `}
    >
      <div className={`${full ? "mt-0.5 shrink-0" : ""} p-1.5 rounded-lg ${selected ? "bg-primary/10" : "bg-muted"}`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className={`text-xs mt-0.5 ${selected ? "text-primary/70" : "text-muted-foreground"}`}>{description}</p>
      </div>
    </button>
  )
}

export default Auth
