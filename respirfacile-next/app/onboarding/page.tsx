"use client";

import { LogoIcon } from "@/components/ui/Logo"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;
type ProfileType = "adult_saos_mild" | "adult_saos_severe" | "adult_tmof" | "adult_mixed" | null;

interface OnboardingData {
  full_name: string;
  age: number | null;
  profileType: ProfileType;
  objective: string;
  availability: string;
}

const PROFILE_OPTIONS = [
  {
    value: "adult_saos_mild",
    label: "Je ronfle ou j'ai des apnées",
    icon: "🌙",
    desc: "Votre médecin a détecté de l'apnée du sommeil. Vous ne portez pas encore d'appareil la nuit.",
    color: "border-blue-300 bg-blue-50",
    activeColor: "border-blue-500 bg-blue-50",
    iconBg: "bg-blue-100",
    exercises: ["Pause Contrôlée", "Cohérence cardiaque", "Respiration nasale"],
  },
  {
    value: "adult_saos_severe",
    label: "J'ai des apnées et je porte un masque la nuit",
    icon: "😴",
    desc: "Vous dormez avec un CPAP. Votre praticien veut renforcer l'efficacité de votre traitement.",
    color: "border-purple-300 bg-purple-50",
    activeColor: "border-purple-500 bg-purple-50",
    iconBg: "bg-purple-100",
    exercises: ["Cohérence cardiaque", "Exercices de langue", "Respiration abdominale"],
  },
  {
    value: "adult_tmof",
    label: "On m'a prescrit des exercices de bouche ou de langue",
    icon: "👅",
    desc: "Votre orthophoniste ou kiné a prescrit une rééducation myofonctionnelle.",
    color: "border-amber-300 bg-amber-50",
    activeColor: "border-amber-500 bg-amber-50",
    iconBg: "bg-amber-100",
    exercises: ["Exercices de langue", "Renforcement palais", "Respiration nasale"],
  },
  {
    value: "adult_mixed",
    label: "J'ai les deux à la fois",
    icon: "🎯",
    desc: "Apnée du sommeil ET rééducation orofaciale prescrites. Programme complet.",
    color: "border-forest-300 bg-forest-50",
    activeColor: "border-forest-600 bg-forest-50",
    iconBg: "bg-forest-100",
    exercises: ["Programme complet", "Pause Contrôlée", "Renforcement orofacial"],
  },
];

const OBJECTIVE_OPTIONS = [
  { value: "better_sleep", label: "Mieux dormir", icon: "💤", desc: "Se réveiller reposé" },
  { value: "reduce_snoring", label: "Arrêter de ronfler", icon: "🔇", desc: "Pour moi et mon entourage" },
  { value: "improve_breathing", label: "Mieux respirer au quotidien", icon: "👃", desc: "Moins de fatigue, plus d'énergie" },
  { value: "prepare_surgery", label: "Préparer une opération", icon: "🏥", desc: "Renforcer avant l'intervention" },
  { value: "recover", label: "Compléter mon traitement", icon: "✨", desc: "Amplifier les effets du suivi" },
  { value: "other", label: "Autre objectif", icon: "🎯", desc: "Mon praticien me l'a prescrit" },
];

const AVAILABILITY_OPTIONS = [
  { value: "morning", label: "Le matin", sublabel: "Avant de commencer la journée", icon: "🌅" },
  { value: "afternoon", label: "L'après-midi", sublabel: "Pendant une pause", icon: "☀️" },
  { value: "evening", label: "Le soir", sublabel: "Avant de dormir, idéal pour les exercices de gorge", icon: "🌙" },
  { value: "flexible", label: "Pas de créneau fixe", sublabel: "Je m'adapte selon les jours", icon: "🔄" },
];

// Illustrations SVG légères pour chaque étape
function IllustrationStep1() {
  return (
    <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto mb-6" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle fond */}
      <circle cx="100" cy="70" r="55" fill="#F0F4E8" />
      {/* Silhouette corps */}
      <circle cx="100" cy="48" r="18" fill="#2D5016" opacity="0.8" />
      <path d="M72 110 Q72 85 100 82 Q128 85 128 110" fill="#2D5016" opacity="0.6" />
      {/* Ondes de respiration */}
      <path d="M55 70 Q65 60 75 70 Q85 80 95 70 Q105 60 115 70 Q125 80 135 70 Q145 60 155 70" stroke="#8B9E6A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Feuilles déco */}
      <ellipse cx="40" cy="50" rx="8" ry="14" fill="#8B9E6A" opacity="0.5" transform="rotate(-30 40 50)" />
      <ellipse cx="160" cy="90" rx="8" ry="14" fill="#8B9E6A" opacity="0.5" transform="rotate(30 160 90)" />
    </svg>
  );
}

function IllustrationStep2({ profileType }: { profileType: ProfileType }) {
  const icons: Record<string, string> = {
    adult_saos_mild: "🌙",
    adult_saos_severe: "😴",
    adult_tmof: "👅",
    adult_mixed: "🎯",
  };
  return (
    <div className="flex justify-center mb-4">
      <div className="w-20 h-20 rounded-full bg-forest-100 border-4 border-forest-200 flex items-center justify-center text-4xl">
        {profileType ? icons[profileType] : "🩺"}
      </div>
    </div>
  );
}

function IllustrationStep3() {
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto mb-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="60" r="45" fill="#FEF3C7" />
      {/* Étoile objectif */}
      <path d="M100 25 L106 45 L128 45 L111 57 L117 77 L100 65 L83 77 L89 57 L72 45 L94 45 Z" fill="#F59E0B" opacity="0.8" />
      {/* Cercles concentriques */}
      <circle cx="100" cy="60" r="45" stroke="#FCD34D" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="60" r="35" stroke="#FCD34D" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
    </svg>
  );
}

function IllustrationStep4() {
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto mb-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="60" r="45" fill="#F0F4E8" />
      {/* Horloge */}
      <circle cx="100" cy="60" r="32" fill="white" stroke="#2D5016" strokeWidth="2" />
      <line x1="100" y1="60" x2="100" y2="36" stroke="#2D5016" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="60" x2="118" y2="66" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="60" r="3" fill="#2D5016" />
      {/* Petits tirets heure */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
        <line
          key={i}
          x1={100 + 27 * Math.sin(deg * Math.PI / 180)}
          y1={60 - 27 * Math.cos(deg * Math.PI / 180)}
          x2={100 + 30 * Math.sin(deg * Math.PI / 180)}
          y2={60 - 30 * Math.cos(deg * Math.PI / 180)}
          stroke="#2D5016"
          strokeWidth={i % 3 === 0 ? 2 : 1}
          opacity="0.5"
        />
      ))}
    </svg>
  );
}

// Étape résultat, programme personnalisé
function ResultStep({ data }: { data: OnboardingData }) {
  const profile = PROFILE_OPTIONS.find(p => p.value === data.profileType);
  const firstName = data.full_name.split(" ")[0];

  const weekPlan = [
    { day: "Lun", exercises: ["Pause Contrôlée", "Cohérence"], done: false },
    { day: "Mar", exercises: ["Langue au palais"], done: false },
    { day: "Mer", exercises: ["Pause Contrôlée", "Nasale"], done: false },
    { day: "Jeu", exercises: ["Cohérence cardiaque"], done: false },
    { day: "Ven", exercises: ["Pause Contrôlée", "Langue"], done: false },
    { day: "Sam", exercises: ["Repos actif"], done: false },
    { day: "Dim", exercises: ["Repos"], done: false },
  ];

  return (
    <div className="space-y-5">
      {/* Hero personnalisé */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-600 rounded-3xl p-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
            <path d="M0 50 Q25 20 50 50 Q75 80 100 50 Q125 20 150 50 Q175 80 200 50" stroke="white" strokeWidth="3" />
            <path d="M0 70 Q25 40 50 70 Q75 100 100 70 Q125 40 150 70 Q175 100 200 70" stroke="white" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="text-4xl mb-2">🌿</div>
          <h3 className="text-xl font-bold mb-1">
            {firstName ? `${firstName}, votre programme est prêt !` : "Votre programme est prêt !"}
          </h3>
          <p className="text-white/80 text-sm">Personnalisé pour : {profile?.label || "votre situation"}</p>
        </div>
      </div>

      {/* Semaine type */}
      <div>
        <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">Votre semaine type</p>
        <div className="grid grid-cols-7 gap-1">
          {weekPlan.map((d, i) => (
            <div key={i} className={`rounded-xl p-2 text-center ${i < 5 ? "bg-forest-50 border border-forest-100" : "bg-beige-100 border border-beige-200 opacity-60"}`}>
              <p className="text-xs font-bold text-forest-700 mb-1">{d.day}</p>
              {i < 5 ? (
                <div className="space-y-0.5">
                  {d.exercises.slice(0, 1).map((ex, j) => (
                    <div key={j} className="w-4 h-4 rounded-full bg-forest-400 mx-auto" title={ex} />
                  ))}
                  {d.exercises.length > 1 && (
                    <div className="w-3 h-3 rounded-full bg-copper-400 mx-auto" title={d.exercises[1]} />
                  )}
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-beige-300 mx-auto" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-forest-500 text-center mt-2">🟢 Séance active &nbsp;·&nbsp; 🟠 Exercice bonus &nbsp;·&nbsp; ⬜ Repos</p>
      </div>

      {/* Exercices prescrits */}
      <div>
        <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">Exercices inclus dans votre programme</p>
        <div className="space-y-2">
          {(profile?.exercises || ["Pause Contrôlée", "Cohérence cardiaque"]).map((ex, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-beige-200">
              <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-sm font-bold text-forest-700">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-forest-800">{ex}</p>
              <div className="ml-auto text-xs text-forest-500">~5 min</div>
            </div>
          ))}
        </div>
      </div>

      {/* Objectif 30j */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🏅</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Objectif à 30 jours</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Une amélioration mesurable de votre score de Pause Contrôlée. La plupart des patients voient une différence dès la 2e semaine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<OnboardingData>({
    full_name: "",
    age: null,
    profileType: null,
    objective: "",
    availability: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      setUser(currentUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, age")
        .eq("id", currentUser.id)
        .single();

      if (profile?.full_name) setData((prev) => ({ ...prev, full_name: profile.full_name }));
      if (profile?.age) setData((prev) => ({ ...prev, age: profile.age }));

      setLoading(false);
    };
    checkUser();
  }, []);

  const handleNext = async () => {
    if (step < 5) {
      // À l'étape 4, construire le résultat avant d'avancer
      setStep((step + 1) as OnboardingStep);
      return;
    }

    // Étape finale, sauvegarde
    setSaving(true);
    setSaveError(null);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: data.full_name, age: data.age })
        .eq("id", user.id);

      if (profileError) throw profileError;

      try {
        await supabase
          .from("patient_programs")
          .insert({
            patient_id: user.id,
            profile_type: data.profileType,
            week_number: 1,
            is_active: true,
          });
      } catch (_) { /* silencieux si table absente */ }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Erreur onboarding:", err);
      setSaveError("Une erreur est survenue. Réessayez ou passez cette étape.");
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-forest-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-forest-600 text-sm font-medium">Préparation de votre espace…</p>
        </div>
      </div>
    );
  }

  const TOTAL_STEPS = 5;
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepMeta = [
    { label: "Vous", icon: "👤" },
    { label: "Situation", icon: "🩺" },
    { label: "Objectif", icon: "🎯" },
    { label: "Rythme", icon: "⏰" },
    { label: "Programme", icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      {/* Header minimal */}
      <header className="w-full px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoIcon size={26} />
            <span style={{ fontWeight: 600, color: "#2D5016", letterSpacing: "-0.01em", fontSize: "15px" }}>
              Respir<span style={{ color: "#8B4513" }}>facile</span>
            </span>
          </Link>
          {step < 5 && (
            <span className="text-xs text-forest-500 font-medium">Étape {step}/4</span>
          )}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="w-full bg-beige-300 h-1">
        <div
          className="h-1 bg-forest-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Indicateurs d'étapes (petits points) */}
          <div className="flex justify-center gap-2 mb-8">
            {stepMeta.map((s, i) => (
              <div
                key={i}
                className={`transition-all duration-300 ${
                  i + 1 === step
                    ? "w-8 h-2 rounded-full bg-forest-600"
                    : i + 1 < step
                    ? "w-2 h-2 rounded-full bg-forest-400"
                    : "w-2 h-2 rounded-full bg-beige-300"
                }`}
                title={s.label}
              />
            ))}
          </div>

          {/* ─── ÉTAPE 1, Qui êtes-vous ? ─── */}
          {step === 1 && (
            <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
              <IllustrationStep1 />
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-forest-800 mb-2">👋 Bienvenue !</h2>
                <p className="text-forest-600">Faisons connaissance. 2 minutes chrono.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-forest-700 mb-2">Votre prénom et nom</label>
                  <input
                    type="text"
                    value={data.full_name}
                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                    placeholder="ex : Sophie Martin"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-beige-300 bg-white text-forest-800 placeholder-forest-400 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-forest-700 mb-2">Votre âge</label>
                  <input
                    type="number"
                    value={data.age || ""}
                    onChange={(e) => setData({ ...data, age: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="ex : 45"
                    min="18"
                    max="120"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-beige-300 bg-white text-forest-800 placeholder-forest-400 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 transition-all text-base"
                  />
                  <p className="text-xs text-forest-500 mt-1.5 flex items-center gap-1">
                    <span>🔒</span>
                    L&apos;âge adapte les normes respiratoires à votre profil.
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!data.full_name.trim() || !data.age}
                className="w-full mt-8 px-6 py-4 rounded-2xl font-semibold text-lg transition-all bg-forest-700 text-white hover:bg-forest-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                C&apos;est parti →
              </button>
            </div>
          )}

          {/* ─── ÉTAPE 2, Situation ─── */}
          {step === 2 && (
            <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">🩺 Quelle est votre situation ?</h2>
                <p className="text-forest-600 text-sm">Votre praticien pourra affiner ensuite, choisissez ce qui vous ressemble le plus.</p>
              </div>

              <div className="space-y-3 mb-8">
                {PROFILE_OPTIONS.map((option) => {
                  const isSelected = data.profileType === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, profileType: option.value as ProfileType })}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 group ${
                        isSelected
                          ? `${option.activeColor} shadow-sm`
                          : "border-beige-300 hover:border-beige-400 bg-white"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${
                        isSelected ? option.iconBg : "bg-beige-100 group-hover:bg-beige-200"
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold leading-snug ${isSelected ? "text-forest-900" : "text-forest-800"}`}>
                          {option.label}
                        </p>
                        <p className="text-sm text-forest-600 mt-0.5 leading-relaxed">{option.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="px-5 py-3.5 rounded-2xl font-medium border-2 border-beige-300 text-forest-700 hover:border-forest-300 transition-all">
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={!data.profileType}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-semibold transition-all bg-forest-700 text-white hover:bg-forest-800 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 3, Objectif ─── */}
          {step === 3 && (
            <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
              <IllustrationStep3 />
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">Quel est votre objectif principal ?</h2>
                <p className="text-forest-600 text-sm">Optionnel, aide à personnaliser vos rappels.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {OBJECTIVE_OPTIONS.map((option) => {
                  const isSelected = data.objective === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, objective: option.value })}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-copper-500 bg-copper-50 shadow-sm"
                          : "border-beige-300 hover:border-copper-200 bg-white"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{option.icon}</span>
                      <p className={`font-semibold text-sm leading-tight ${isSelected ? "text-copper-800" : "text-forest-800"}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-forest-500 mt-0.5">{option.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="px-5 py-3.5 rounded-2xl font-medium border-2 border-beige-300 text-forest-700 hover:border-forest-300 transition-all">
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-semibold transition-all bg-forest-700 text-white hover:bg-forest-800 hover:shadow-md"
                >
                  {data.objective ? "Continuer →" : "Passer →"}
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 4, Rythme ─── */}
          {step === 4 && (
            <div className="bg-beige-100 rounded-4xl border border-beige-300 p-8 shadow-beige">
              <IllustrationStep4 />
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">⏰ Quand pratiquez-vous ?</h2>
                <p className="text-forest-600 text-sm">15 minutes suffisent. On s&apos;adapte à votre agenda.</p>
              </div>

              <div className="space-y-3 mb-8">
                {AVAILABILITY_OPTIONS.map((option) => {
                  const isSelected = data.availability === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, availability: option.value })}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                        isSelected
                          ? "border-forest-600 bg-forest-50 shadow-sm"
                          : "border-beige-300 hover:border-forest-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl w-8 text-center">{option.icon}</span>
                      <div>
                        <p className={`font-semibold ${isSelected ? "text-forest-900" : "text-forest-800"}`}>{option.label}</p>
                        <p className="text-xs text-forest-500 mt-0.5">{option.sublabel}</p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-forest-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="px-5 py-3.5 rounded-2xl font-medium border-2 border-beige-300 text-forest-700 hover:border-forest-300 transition-all">
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-semibold transition-all bg-forest-700 text-white hover:bg-forest-800 hover:shadow-md"
                >
                  Voir mon programme →
                </button>
              </div>
            </div>
          )}

          {/* ─── ÉTAPE 5, Programme résultat ─── */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Card résultat */}
              <div className="bg-beige-100 rounded-4xl border border-beige-300 p-6 shadow-beige">
                <ResultStep data={data} />
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                  {saveError}
                </div>
              )}

              {/* CTA principal */}
              <button
                onClick={handleNext}
                disabled={saving}
                className="w-full px-6 py-5 rounded-2xl font-bold text-lg transition-all bg-forest-700 text-white hover:bg-forest-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création de votre programme…
                  </>
                ) : (
                  <>
                    🌿 Commencer mes exercices
                  </>
                )}
              </button>

              <p className="text-center text-xs text-forest-500">
                Votre programme sera affiné par votre praticien lors du prochain rdv.
              </p>

              <button onClick={handleBack} className="w-full text-center text-sm text-forest-500 hover:text-forest-700 underline underline-offset-2 transition-colors">
                ← Modifier mes réponses
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
