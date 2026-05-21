"use client";

import { LogoIcon } from "@/components/ui/Logo"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingClientProps {
  therapistCode: string;
  firstName: string;
}

type Step = 1 | 2 | 3 | 4;

const FEATURES = [
  {
    icon: "📊",
    title: "Suivi en temps réel",
    desc: "Visualisez l'activité de chaque patient, dernière séance, score de Pause Contrôlée, progression semaine par semaine.",
  },
  {
    icon: "💊",
    title: "Prescriptions personnalisées",
    desc: "Assignez des exercices spécifiques à chaque patient selon son profil SAOS, TMOF ou mixte.",
  },
  {
    icon: "📩",
    title: "Messagerie intégrée",
    desc: "Envoyez des encouragements ou des corrections directement dans l'app. Vos patients reçoivent une notification.",
  },
  {
    icon: "📄",
    title: "Bilans PDF exportables",
    desc: "Générez un rapport de progression complet en un clic, idéal pour le dossier médical ou le bilan de suivi.",
  },
];

const SHARE_METHODS = [
  { icon: "💬", label: "SMS", action: "Envoyez-le par texto après la consultation" },
  { icon: "📧", label: "Email", action: "Copié dans votre mail de bienvenue" },
  { icon: "🗣️", label: "En séance", label2: "Dicté oralement, le code est mémorisable" },
];

// Illustration confetti pure CSS
function Confetti() {
  const colors = ["#2D5016", "#8B4513", "#F59E0B", "#3B82F6", "#EC4899", "#10B981"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            opacity: 0.7,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 1.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Mini dashboard preview, étape 3
function DashboardPreview({ therapistCode }: { therapistCode: string }) {
  const fakePatients = [
    { name: "Marie D.", status: "active", days: 1, sessions: 12 },
    { name: "Jean-Pierre L.", status: "slipping", days: 4, sessions: 7 },
    { name: "Isabelle M.", status: "new", days: 0, sessions: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-sm">
      {/* Header dashboard miniature */}
      <div className="bg-beige-50 border-b border-beige-200 px-4 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="text-xs text-forest-500 ml-2 font-mono">respirfacile.fr/therapist</span>
      </div>
      {/* Stats mini */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-beige-100">
        {[
          { v: "3", l: "patients", icon: "👥" },
          { v: "2", l: "actifs", icon: "🟢" },
          { v: "1", l: "alerte", icon: "⚠️" },
        ].map((s, i) => (
          <div key={i} className="bg-beige-50 rounded-xl px-2 py-2 text-center">
            <p className="text-sm font-bold text-forest-800">{s.v}</p>
            <p className="text-xs text-forest-500">{s.icon} {s.l}</p>
          </div>
        ))}
      </div>
      {/* Liste patients mini */}
      <div className="divide-y divide-beige-100">
        {fakePatients.map((p, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              p.status === "active" ? "bg-green-100 text-green-700" :
              p.status === "slipping" ? "bg-amber-100 text-amber-700" :
              "bg-beige-200 text-beige-500"
            }`}>
              {p.name.split(" ").map(w => w[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-forest-800 truncate">{p.name}</p>
              <p className="text-xs text-forest-400">
                {p.sessions > 0 ? `${p.sessions} séances` : "Pas encore commencé"}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              p.status === "active" ? "bg-green-100 text-green-700" :
              p.status === "slipping" ? "bg-amber-100 text-amber-700" :
              "bg-beige-200 text-beige-600"
            }`}>
              {p.status === "active" ? "✅ Actif" : p.status === "slipping" ? "⚠️ En baisse" : "🆕 Nouveau"}
            </span>
          </div>
        ))}
        {/* Ligne "inviter" */}
        <div className="px-4 py-2.5 flex items-center gap-3 opacity-50">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-forest-300 flex items-center justify-center text-forest-400 text-xs">
            +
          </div>
          <p className="text-xs text-forest-500">Invitez votre prochain patient avec le code <strong className="font-mono">{therapistCode}</strong></p>
        </div>
      </div>
    </div>
  );
}

export function OnboardingClient({ therapistCode, firstName }: OnboardingClientProps) {
  const [step, setStep] = useState<Step>(1);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(therapistCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const goToDashboard = () => {
    router.push("/therapist");
  };

  const progress = ((step - 1) / 3) * 100;

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
      if (step === 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } else {
      goToDashboard();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  return (
    <div className="min-h-screen bg-beige-200 flex flex-col relative">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoIcon size={26} />
            <span style={{ fontWeight: 600, color: "#2D5016", letterSpacing: "-0.01em", fontSize: "15px" }}>
              Respir<span style={{ color: "#8B4513" }}>facile</span>
            </span>
          </Link>
          {step < 4 && (
            <span className="text-xs text-forest-500 font-medium bg-beige-200 px-3 py-1 rounded-full">
              Étape {step}/3
            </span>
          )}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="w-full bg-beige-300 h-1">
        <div
          className="h-1 bg-forest-600 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-xl">

          {/* Indicateurs étapes */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`transition-all duration-300 ${
                  s === step
                    ? "w-8 h-2 rounded-full bg-forest-600"
                    : s < step
                    ? "w-2 h-2 rounded-full bg-forest-400"
                    : "w-2 h-2 rounded-full bg-beige-300"
                }`}
              />
            ))}
          </div>

          {/* ─── ÉTAPE 1, Bienvenue + fonctionnalités ─── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Hero */}
              <div className="bg-gradient-to-br from-forest-800 to-forest-600 rounded-4xl p-8 text-white text-center relative overflow-hidden">
                {/* Pattern de fond */}
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                    <path d="M0 100 Q50 50 100 100 Q150 150 200 100 Q250 50 300 100 Q350 150 400 100" stroke="white" strokeWidth="4" />
                    <path d="M0 130 Q50 80 100 130 Q150 180 200 130 Q250 80 300 130 Q350 180 400 130" stroke="white" strokeWidth="2" opacity="0.5" />
                    <path d="M0 70 Q50 20 100 70 Q150 120 200 70 Q250 20 300 70 Q350 120 400 70" stroke="white" strokeWidth="2" opacity="0.3" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🌿</div>
                  <h1 className="font-display text-3xl font-bold mb-2">
                    {firstName ? `Bienvenue, ${firstName} !` : "Bienvenue !"}
                  </h1>
                  <p className="text-white/80 max-w-sm mx-auto leading-relaxed">
                    Votre espace praticien Respirfacile est prêt. Voici comment en tirer le meilleur parti en 3 minutes.
                  </p>
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-3">
                {FEATURES.map((f, i) => (
                  <div key={i} className="bg-beige-100 rounded-2xl border border-beige-300 p-4 shadow-sm">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <p className="font-semibold text-forest-800 text-sm mb-1">{f.title}</p>
                    <p className="text-xs text-forest-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Essai info */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                <span className="text-xl mt-0.5">🎁</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">30 jours d&apos;essai gratuit</p>
                  <p className="text-xs text-amber-700 mt-0.5">Sans CB. Vous activez votre abonnement seulement si vous souhaitez continuer au bout d&apos;un mois.</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-semibold text-lg bg-forest-700 text-white hover:bg-forest-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Configurer mon accès →
              </button>
            </div>
          )}

          {/* ─── ÉTAPE 2, Code PRO ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-forest-100 border-4 border-forest-200 flex items-center justify-center text-3xl mx-auto mb-4">
                    🔑
                  </div>
                  <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">Votre code Pro</h2>
                  <p className="text-forest-600 text-sm max-w-xs mx-auto">
                    C&apos;est la clé de votre cabinet numérique. Partagez-le à vos patients, ils s&apos;y connectent gratuitement.
                  </p>
                </div>

                {/* Code display */}
                <div className="bg-forest-900 rounded-3xl p-8 text-center mb-6 relative overflow-hidden">
                  {/* Effet lumineux */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-forest-400/50 rounded-full blur-sm" />
                  <p className="text-xs text-beige-400 uppercase tracking-[0.2em] font-semibold mb-4">Votre code Pro</p>
                  <p className="font-mono font-black text-beige-100 text-4xl sm:text-5xl tracking-[0.15em] mb-6 select-all">
                    {therapistCode}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all ${
                      copied
                        ? "bg-green-500 text-white scale-95"
                        : "bg-copper-500 hover:bg-copper-400 text-white hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copié dans le presse-papiers !
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier le code
                      </>
                    )}
                  </button>
                </div>

                {/* Comment le partager */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">Comment le partager ?</p>
                  {[
                    { icon: "💬", label: "Par SMS", desc: "Envoyez un texto après la consultation" },
                    { icon: "📧", label: "Par email", desc: "Collez-le dans votre mail de bienvenue" },
                    { icon: "🗣️", label: "En séance", desc: "Dictez-le, il est court et mémorisable" },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 bg-beige-50 rounded-xl px-4 py-3 border border-beige-200">
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-forest-800">{m.label}</p>
                        <p className="text-xs text-forest-500">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-forest-50 border border-forest-200 rounded-2xl px-4 py-3 text-center text-sm text-forest-700 mb-6">
                  <strong>Rappel :</strong> Vos patients accèdent gratuitement. Vous seul payez l&apos;abonnement.
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="px-5 py-3.5 rounded-2xl font-medium border-2 border-beige-300 text-forest-700 hover:border-forest-300 transition-all">
                    ← Retour
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-semibold bg-forest-700 text-white hover:bg-forest-800 hover:shadow-md transition-all"
                  >
                    Voir mon tableau de bord →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 3, Preview dashboard ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">📋 Voici votre tableau de bord</h2>
                  <p className="text-forest-600 text-sm">
                    Dès qu&apos;un patient entre votre code, il apparaît ici automatiquement.
                  </p>
                </div>

                {/* Preview dashboard */}
                <DashboardPreview therapistCode={therapistCode} />

                {/* Comment ça marche */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider">Le flux en 3 actions</p>
                  {[
                    { step: "1", icon: "📤", text: `Vous partagez le code ${therapistCode}` },
                    { step: "2", icon: "📱", text: "Votre patient s'inscrit sur respirfacile.fr en 2 min" },
                    { step: "3", icon: "👀", text: "Il apparaît immédiatement dans votre liste patients" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-beige-50 rounded-xl px-4 py-3">
                      <div className="w-7 h-7 rounded-full bg-forest-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <p className="text-sm text-forest-800">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="px-5 py-3.5 rounded-2xl font-medium border-2 border-beige-300 text-forest-700 hover:border-forest-300 transition-all">
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-semibold bg-forest-700 text-white hover:bg-forest-800 hover:shadow-md transition-all"
                >
                  Je suis prêt(e) ! →
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 4, Confetti + CTA final ─── */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Card victoire */}
              <div className="bg-beige-100 rounded-4xl border border-beige-300 p-10 shadow-beige text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="font-display text-3xl font-bold text-forest-800 mb-3">
                  Votre cabinet est prêt !
                </h2>
                <p className="text-forest-600 max-w-sm mx-auto leading-relaxed mb-8">
                  {firstName && `${firstName}, vous`}{!firstName && "Vous"} avez tout ce qu&apos;il faut pour commencer. Invitez votre premier patient dès aujourd&apos;hui, ça prend 2 minutes.
                </p>

                {/* Code encore visible */}
                <div className="bg-forest-50 border-2 border-forest-200 rounded-2xl px-6 py-4 inline-block mb-8">
                  <p className="text-xs text-forest-500 uppercase tracking-wider font-semibold mb-1">Votre code</p>
                  <p className="font-mono font-bold text-forest-800 text-3xl tracking-[0.15em]">{therapistCode}</p>
                </div>

                {/* Checklist rapide */}
                <div className="text-left space-y-2 mb-8">
                  {[
                    { text: "Compte créé", done: true },
                    { text: "Code Pro activé", done: true },
                    { text: "Tableau de bord configuré", done: true },
                    { text: "Premier patient invité", done: false, highlight: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                      item.highlight ? "bg-copper-50 border border-copper-200" : "bg-beige-50 border border-beige-200"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        item.done ? "bg-green-500 text-white" : "bg-copper-100 border-2 border-copper-300 text-copper-600"
                      }`}>
                        {item.done ? "✓" : "→"}
                      </div>
                      <p className={`text-sm font-medium ${
                        item.highlight ? "text-copper-800 font-semibold" : item.done ? "text-forest-600" : "text-forest-800"
                      }`}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={goToDashboard}
                  className="w-full py-5 rounded-2xl font-bold text-xl bg-forest-700 text-white hover:bg-forest-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                >
                  <span>🌿</span>
                  Accéder à mon tableau de bord
                </button>

                <p className="text-xs text-forest-400 mt-4">
                  Depuis votre tableau de bord → bouton &quot;Ajouter un patient&quot;
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
