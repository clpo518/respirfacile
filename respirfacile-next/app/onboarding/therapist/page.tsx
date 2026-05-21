'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function TherapistOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [therapistCode, setTherapistCode] = useState('');
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        loadTherapistCode(user.id, supabase);
      }
    });
  }, []);

  const loadTherapistCode = async (userId: string, supabase: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('therapist_code')
        .eq('id', userId)
        .single();

      if (profile?.therapist_code) {
        setTherapistCode(profile.therapist_code);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#2D5016', '#8B4513', '#F5F0E8'],
    });
  };

  const handleRevealCode = () => {
    setCodeRevealed(true);
    setTimeout(() => triggerConfetti(), 100);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(therapistCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push('/therapist');
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: step >= num ? 1 : 0.8,
                    opacity: 1,
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    step >= num
                      ? 'bg-forest-600 text-white'
                      : 'bg-beige-300 text-forest-600'
                  }`}
                >
                  {num}
                </motion.div>
                {num < 3 && (
                  <div
                    className={`h-1 w-16 mx-2 rounded-full transition-colors ${
                      step > num ? 'bg-forest-600' : 'bg-beige-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-forest-600 font-medium">
            Étape {step} de 3 - Configuration de votre cabinet
          </p>
        </div>

        {/* Content sections */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-beige-200 p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-forest-800 mb-4">
                🎯 Bienvenue Dr. {user.user_metadata?.full_name || ''}
              </h1>
              <p className="text-forest-600 text-lg mb-6">
                Vous êtes maintenant enregistré en tant qu'orthophoniste ou kinésithérapeute
                sur Respirfacile. Vous pourrez inviter vos patients à vous rejoindre
                gratuitement.
              </p>
              <div className="bg-forest-50 rounded-2xl p-6 border border-forest-200 mb-8">
                <h3 className="font-semibold text-forest-800 mb-3">✨ Avant de commencer:</h3>
                <ul className="space-y-2 text-forest-700">
                  <li>✓ Consultez votre code PRO professionnel unique</li>
                  <li>✓ Partagez-le avec vos patients pour les inscrire gratuitement</li>
                  <li>✓ Accédez immédiatement à leur dashboard clinique</li>
                </ul>
              </div>
              <button
                onClick={handleContinue}
                className="w-full px-6 py-4 rounded-2xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors shadow-md"
              >
                Continuer vers votre code PRO →
              </button>
            </div>
          )}

          {step === 2 && therapistCode && (
            <div className="bg-white rounded-3xl border border-beige-200 p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-forest-800 mb-2">
                🔑 Votre code PRO professionnel
              </h2>
              <p className="text-forest-600 mb-8">
                Partagez ce code avec vos patients pour qu'ils vous rejoignent gratuitement.
              </p>

              {!codeRevealed ? (
                <motion.div
                  onClick={handleRevealCode}
                  className="cursor-pointer bg-gradient-to-r from-forest-50 to-copper-50 rounded-3xl p-12 border-2 border-dashed border-forest-300 hover:border-forest-400 transition-colors mb-8 text-center"
                >
                  <p className="text-forest-600 font-medium mb-3">Cliquez pour révéler</p>
                  <p className="text-4xl">🎭</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-forest-50 to-copper-50 rounded-3xl p-12 border-2 border-forest-300 mb-8 text-center"
                >
                  <p className="text-forest-600 text-sm font-medium mb-4">Votre code unique</p>
                  <div className="bg-white rounded-2xl p-6 mb-6 font-mono">
                    <p className="text-4xl font-bold text-forest-800 tracking-widest">
                      {therapistCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`w-full px-6 py-3 rounded-2xl font-semibold transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-forest-600 text-white hover:bg-forest-700'
                    }`}
                  >
                    {copied ? '✓ Copié' : '📋 Copier le code'}
                  </button>
                </motion.div>
              )}

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-8">
                <h3 className="font-semibold text-amber-900 mb-3">💡 Comment partager:</h3>
                <ol className="space-y-2 text-amber-800 text-sm">
                  <li>1. Copiez votre code PRO</li>
                  <li>2. Partagez-le par email, SMS ou lors de votre première visite</li>
                  <li>3. Vos patients l'utiliseront lors de leur inscription</li>
                  <li>4. Vous les verrez immédiatement dans votre tableau de bord</li>
                </ol>
              </div>

              <button
                onClick={handleContinue}
                className="w-full px-6 py-4 rounded-2xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors shadow-md"
              >
                Suivant : Découvrir mon tableau de bord →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-3xl border border-beige-200 p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-forest-800 mb-4">
                📊 Votre tableau de bord professionnel
              </h2>
              <p className="text-forest-600 mb-8">
                Découvrez tous les outils dont vous avez besoin pour suivre vos patients.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 rounded-2xl bg-forest-50 border border-forest-200">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h3 className="font-semibold text-forest-800">Mes patients</h3>
                    <p className="text-sm text-forest-600">
                      Liste complète avec statut d'activité et notes cliniques
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-green-50 border border-green-200">
                  <div className="text-3xl">📓</div>
                  <div>
                    <h3 className="font-semibold text-green-900">Journal patient</h3>
                    <p className="text-sm text-green-700">
                      Suivez bien-être, sommeil, anxiété et respiration nasale
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-copper-50 border border-copper-200">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-copper-900">Graphiques</h3>
                    <p className="text-sm text-copper-700">
                      Observance et progression sur 4 semaines, détection des ralentissements
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Alertes intelligentes</h3>
                    <p className="text-sm text-amber-700">
                      Signalez les patients inactifs ou en difficulté automatiquement
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full px-6 py-4 rounded-2xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors shadow-md mb-4"
              >
                🚀 Accéder à mon tableau de bord
              </button>

              <p className="text-center text-forest-600 text-sm">
                Vous pouvez toujours modifier vos paramètres plus tard
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
