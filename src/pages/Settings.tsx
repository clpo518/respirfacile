import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import {
  User, Mail, LogOut, ChevronRight, Shield,
  Bell, HelpCircle, Wind, Copy, CheckCheck
} from "lucide-react"
import { AppLayout } from "@/components/AppLayout"
import { useToast } from "@/hooks/use-toast"

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate()
  const { profile, isTherapist, isSoloPatient, signOut } = useAuth()
  const { toast } = useToast()
  const [signingOut, setSigningOut] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate("/auth")
    } catch {
      setSigningOut(false)
    }
  }

  const copyCode = () => {
    if (!profile?.therapist_code) return
    navigator.clipboard.writeText(profile.therapist_code)
    setCodeCopied(true)
    toast({ description: "Code copié !" })
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const roleLabel = () => {
    if (!profile) return ""
    switch (profile.role) {
      case "therapist": return "Orthophoniste"
      case "kine":      return "Kinésithérapeute"
      case "admin":     return "Administrateur"
      case "solo_patient": return "Patient autonome"
      default:          return "Patient"
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  return (
    <AppLayout>
    <div className="pb-24 lg:pb-8">

      {/* ── Header ──────────────────────────── */}
      <header className="px-6 pt-10 lg:pt-12 pb-6">
        <p className="text-sm text-muted-foreground">Mon compte</p>
        <h1 className="font-display text-2xl text-foreground mt-0.5">Paramètres</h1>
      </header>

      <div className="px-6 space-y-5">

        {/* ── Profil card ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-rf p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg text-foreground truncate">
              {profile?.full_name ?? "Utilisateur"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email ?? ""}</p>
            <span className="badge-rf text-[10px] mt-1 inline-block">{roleLabel()}</span>
          </div>
        </motion.div>

        {/* ── Code PRO (thérapeutes uniquement) ── */}
        {isTherapist && profile?.therapist_code && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="card-rf p-4"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Code praticien
            </p>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl text-primary tracking-widest">
                {profile.therapist_code}
              </p>
              <button
                onClick={copyCode}
                className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                {codeCopied
                  ? <CheckCheck className="w-4 h-4 text-primary" />
                  : <Copy className="w-4 h-4 text-primary" />
                }
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Partagez ce code à vos patients pour qu'ils s'inscrivent gratuitement.
            </p>
          </motion.div>
        )}

        {/* ── Abonnement (thérapeutes) ──────── */}
        {isTherapist && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
          >
            <SectionTitle>Abonnement</SectionTitle>
            <div className="card-rf overflow-hidden">
              <SettingsRow
                icon={<Shield className="w-4 h-4" />}
                label="Gérer mon abonnement"
                onClick={() => navigate("/pro/subscription/manage")}
              />
            </div>
          </motion.div>
        )}

        {/* ── Préférences ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <SectionTitle>Préférences</SectionTitle>
          <div className="card-rf overflow-hidden divide-y divide-border">
            <SettingsRow
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
              sublabel="Rappels quotidiens d'exercices"
              onClick={() => toast({ description: "Bientôt disponible" })}
            />
          </div>
        </motion.div>

        {/* ── Support ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionTitle>Support</SectionTitle>
          <div className="card-rf overflow-hidden divide-y divide-border">
            <SettingsRow
              icon={<HelpCircle className="w-4 h-4" />}
              label="Aide & FAQ"
              onClick={() => window.open("mailto:contact@respirfacile.fr", "_blank")}
            />
            <SettingsRow
              icon={<Mail className="w-4 h-4" />}
              label="Nous contacter"
              onClick={() => window.open("mailto:contact@respirfacile.fr", "_blank")}
            />
          </div>
        </motion.div>

        {/* ── Legal ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <SectionTitle>Légal</SectionTitle>
          <div className="card-rf overflow-hidden divide-y divide-border">
            <SettingsRow
              icon={<Shield className="w-4 h-4" />}
              label="Politique de confidentialité"
              onClick={() => navigate("/legal/privacy")}
            />
            <SettingsRow
              icon={<Shield className="w-4 h-4" />}
              label="Conditions d'utilisation"
              onClick={() => navigate("/legal/terms")}
            />
          </div>
        </motion.div>

        {/* ── Déconnexion ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="pb-4"
        >
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </motion.div>

        {/* ── Version ──────────────────────── */}
        <p className="text-center text-[10px] text-muted-foreground pb-4">
          RespirFacile v0.1.0 · Fait avec 🌿 en France
        </p>

      </div>

    </div>
    </AppLayout>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
      {children}
    </p>
  )
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  )
}

export default Settings
