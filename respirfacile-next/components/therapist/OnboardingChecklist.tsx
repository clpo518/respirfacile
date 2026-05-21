'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface OnboardingChecklistProps {
  hasPatients: boolean;
  hasPrescriptions: boolean;
  hasMessages: boolean;
  therapistCode: string;
  firstPatientId?: string;
}

const STEPS = [
  {
    id: 'patient',
    emoji: '👥',
    title: 'Invitez votre premier patient',
    desc: 'Partagez votre code PRO, il rejoint gratuitement en 30 secondes.',
    cta: 'Inviter un patient',
    href: '/therapist/invite',
  },
  {
    id: 'prescription',
    emoji: '💊',
    title: 'Prescrivez des exercices',
    desc: 'Choisissez un programme adapté à son profil. Il le voit immédiatement.',
    cta: 'Prescrire des exercices',
    href: null, // dynamique selon le premier patient
  },
  {
    id: 'message',
    emoji: '💬',
    title: 'Envoyez un premier message',
    desc: 'Un encouragement suffit. Les patients qui reçoivent un message font 2× plus de séances.',
    cta: 'Envoyer un message',
    href: null, // dynamique selon le premier patient
  },
];

export function OnboardingChecklist({
  hasPatients,
  hasPrescriptions,
  hasMessages,
  therapistCode,
  firstPatientId,
}: OnboardingChecklistProps) {
  const doneMap = {
    patient: hasPatients,
    prescription: hasPrescriptions,
    message: hasMessages,
  };

  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const allDone = doneCount === 3;
  const pct = Math.round((doneCount / 3) * 100);

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (allDone && !dismissed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors: ['#2D5016', '#a8c87a', '#8B4513', '#f5f0e8'] });
    }
  }, [allDone, dismissed]);

  if (dismissed) return null;

  return (
    <div className="bg-white rounded-3xl border border-beige-200 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-forest-300 text-xs font-semibold uppercase tracking-widest mb-1">Prise en main</p>
            <h2 className="text-white font-bold text-lg leading-tight">
              {allDone
                ? '🎉 Vous êtes prêt à transformer votre pratique !'
                : `${doneCount}/3 étapes complétées`}
            </h2>
            <p className="text-forest-300 text-sm mt-1">
              {allDone
                ? 'Votre premier patient suit déjà son programme. Bienvenue dans une nouvelle façon de suivre.'
                : 'Complétez les 3 étapes pour débloquer tout le potentiel de Respirfacile.'}
            </p>
          </div>
          {allDone && (
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 text-forest-400 hover:text-forest-200 transition-colors text-xs underline mt-1"
            >
              Masquer
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="h-2 bg-forest-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-copper-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-forest-400">{pct}% complété</span>
            {!allDone && (
              <span className="text-xs text-forest-400">
                Votre code : <strong className="text-copper-300 font-mono">{therapistCode}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="divide-y divide-beige-100">
        {STEPS.map((step, i) => {
          const done = doneMap[step.id as keyof typeof doneMap];
          return (
            <div key={step.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${done ? 'opacity-60' : 'hover:bg-beige-50'}`}>
              {/* Numéro / check */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                done
                  ? 'bg-green-500 text-white'
                  : 'bg-beige-200 text-forest-600'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{step.emoji}</span>
                  <p className={`font-semibold text-sm ${done ? 'line-through text-forest-400' : 'text-forest-800'}`}>
                    {step.title}
                  </p>
                </div>
                <p className="text-xs text-forest-500 leading-relaxed">{step.desc}</p>
              </div>

              {/* CTA */}
              {!done && (() => {
                let href = step.href as string | null;
                if (step.id === 'prescription') href = firstPatientId ? `/therapist/patients/${firstPatientId}/program` : '/therapist/invite';
                if (step.id === 'message') href = firstPatientId ? `/therapist/patients/${firstPatientId}/messages` : '/therapist/invite';
                if (!href) return null;
                return (
                  <Link
                    href={href}
                    className="flex-shrink-0 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
                  >
                    {step.cta} →
                  </Link>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
