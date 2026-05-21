"use client";

import { useState, useEffect } from "react";

type ViewKey = "patient_dashboard" | "session" | "therapist";

const VIEWS: { key: ViewKey; label: string; emoji: string }[] = [
  { key: "patient_dashboard", label: "Vue patient", emoji: "🫁" },
  { key: "session", label: "Séance guidée", emoji: "⏱️" },
  { key: "therapist", label: "Vue ortho", emoji: "🩺" },
];

function PatientDashboardPreview() {
  return (
    <div className="bg-beige-200 rounded-2xl overflow-hidden h-full min-h-[480px] p-3 flex flex-col gap-2">
      {/* Fake header */}
      <div className="bg-beige-100/90 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="font-semibold text-forest-800 text-sm">Bonjour Sophie 👋</span>
        <span className="text-xs text-forest-500">Semaine 3</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "4/5", sub: "séances faites", color: "text-forest-700" },
          { label: "18 j.", sub: "sans interruption", color: "text-copper-700" },
          { label: "+62%", sub: "de régularité", color: "text-forest-700" },
        ].map((s) => (
          <div key={s.sub} className="bg-beige-100 rounded-xl p-2.5 text-center">
            <p className={`font-bold text-sm ${s.color}`}>{s.label}</p>
            <p className="text-xs text-forest-500 leading-tight mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Message ortho */}
      <div className="bg-copper-500/10 border border-copper-500/20 rounded-xl px-3 py-2 flex gap-2">
        <span className="text-base flex-shrink-0">🩺</span>
        <p className="text-xs text-forest-700 leading-relaxed">
          <strong>Votre praticien :</strong> Excellente semaine Sophie ! Continuez comme ça, les résultats arrivent.
        </p>
      </div>

      {/* Exercises list */}
      <div className="flex-1 flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-forest-500 uppercase tracking-wide px-1">Vos exercices du jour</p>
        {[
          { emoji: "💚", name: "Respiration calme 5 min", time: "5 min", done: true, diff: "Facile" },
          { emoji: "🌬️", name: "Respiration par le nez", time: "3 min", done: true, diff: "Facile" },
          { emoji: "🫁", name: "Exercice de retenue", time: "10 min", done: false, diff: "Intermédiaire" },
          { emoji: "👅", name: "Posture de la langue", time: "2 min", done: false, diff: "Facile" },
        ].map((ex) => (
          <div
            key={ex.name}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border ${
              ex.done
                ? "bg-forest-500/5 border-forest-500/30"
                : "bg-beige-100 border-beige-300"
            }`}
          >
            <span className="text-xl">{ex.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-forest-800 truncate">{ex.name}</p>
              <p className="text-xs text-forest-400">{ex.time} · {ex.diff}</p>
            </div>
            {ex.done ? (
              <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-beige-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-beige-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionPreview() {
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");
  const [phaseTime, setPhaseTime] = useState(5);
  const [cycles, setCycles] = useState(3);
  const [elapsed, setElapsed] = useState(67);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseTime((t) => {
        if (t <= 1) {
          setBreathPhase((p) => {
            if (p === "out") setCycles((c) => c + 1);
            return p === "in" ? "out" : "in";
          });
          return 5;
        }
        return t - 1;
      });
      setElapsed((e) => (e >= 300 ? 0 : e + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scale = breathPhase === "in" ? 1 + ((5 - phaseTime) / 5) * 0.3 : 1.3 - ((5 - phaseTime) / 5) * 0.3;
  const progressPct = (elapsed / 300) * 100;

  return (
    <div className="bg-beige-200 rounded-2xl overflow-hidden min-h-[480px] p-3 flex flex-col">
      {/* Fake header */}
      <div className="bg-beige-100/90 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-beige-300 flex items-center justify-center">
          <svg className="w-3 h-3 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="font-semibold text-forest-800 text-sm">💚 Cohérence cardiaque 5-5</span>
      </div>

      {/* Breathing animation */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-forest-500/10 transition-all duration-1000 ease-in-out"
            style={{ transform: `scale(${scale * 1.2})` }}
          />
          <div
            className="absolute inset-0 rounded-full bg-forest-500/20 border border-forest-500/30 transition-all duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="relative w-20 h-20 rounded-full bg-forest-500/30 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-800 tabular-nums leading-none">{phaseTime}</p>
              <p className="text-xs text-forest-600">sec</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="font-display text-xl font-bold text-forest-800">
            {breathPhase === "in" ? "Inspirez" : "Expirez"}
          </p>
          <p className="text-xs text-forest-500 mt-0.5">par le nez</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-forest-500 mb-1">
            <span>{cycles} cycles</span>
            <span>{Math.floor((300 - elapsed) / 60)}:{String((300 - elapsed) % 60).padStart(2, "0")}</span>
          </div>
          <div className="h-1.5 bg-beige-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="bg-forest-500/10 border border-forest-500/20 rounded-xl px-4 py-2.5 text-xs text-forest-600 text-center max-w-xs">
          💡 Idéal 3× par jour. Matin, midi, soir.
        </div>
      </div>
    </div>
  );
}

function TherapistPreview() {
  return (
    <div className="bg-beige-200 rounded-2xl overflow-hidden min-h-[480px] p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="bg-beige-100/90 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="font-semibold text-forest-800 text-sm">Tableau de bord</span>
        <span className="text-xs text-forest-500">12 patients actifs</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Séances ce mois", value: "94", color: "text-forest-700" },
          { label: "Régularité moy.", value: "78%", color: "text-forest-700" },
          { label: "Nouveaux patients", value: "+3", color: "text-copper-600" },
        ].map((s) => (
          <div key={s.label} className="bg-beige-100 rounded-xl p-2.5 text-center">
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
            <p className="text-xs text-forest-500 leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Patients list */}
      <div className="flex-1 flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-forest-500 uppercase tracking-wide px-1">Mes patients</p>
        {[
          { name: "Sophie M.", score: "28 pas", obs: 82, lastSeen: "Auj.", color: "bg-forest-500" },
          { name: "Michel D.", score: "15 pas", obs: 45, lastSeen: "Il y a 3j", color: "bg-copper-500" },
          { name: "Anne-Claire B.", score: "41 pas", obs: 95, lastSeen: "Hier", color: "bg-forest-500" },
          { name: "Paul R.", score: "9 pas", obs: 20, lastSeen: "Il y a 8j", color: "bg-red-400" },
        ].map((p) => (
          <div key={p.name} className="bg-beige-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-beige-300">
            <div className="w-7 h-7 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-forest-700">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-forest-800 truncate">{p.name}</p>
              <p className="text-xs text-forest-400">Score pause : {p.score}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-forest-700">{p.obs}%</p>
              <div className="w-12 h-1.5 bg-beige-300 rounded-full mt-1 overflow-hidden">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.obs}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export button */}
      <div className="bg-forest-500/10 border border-forest-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
        <span className="text-base">📄</span>
        <p className="text-xs text-forest-700 flex-1">
          <strong>Sophie M.</strong>, Rapport de suivi prêt à envoyer au médecin
        </p>
        <div className="bg-forest-500 rounded-lg px-2 py-1 text-xs text-beige-100 font-medium whitespace-nowrap">
          Exporter
        </div>
      </div>
    </div>
  );
}

export function AppPreview() {
  const [activeView, setActiveView] = useState<ViewKey>("patient_dashboard");

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4 bg-beige-300/50 rounded-2xl p-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeView === v.key
                ? "bg-beige-100 text-forest-800 shadow-sm"
                : "text-forest-500 hover:text-forest-700"
            }`}
          >
            <span>{v.emoji}</span>
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        ))}
      </div>

      {/* Preview content */}
      <div className="transition-all duration-300">
        {activeView === "patient_dashboard" && <PatientDashboardPreview />}
        {activeView === "session" && <SessionPreview />}
        {activeView === "therapist" && <TherapistPreview />}
      </div>

      <p className="text-center text-xs text-forest-400 mt-3">
        Aperçu de l'application, données fictives
      </p>
    </div>
  );
}
