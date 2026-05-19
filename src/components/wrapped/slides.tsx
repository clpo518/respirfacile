import React from "react";
import { motion } from "framer-motion";
import SlideLayout from "./SlideLayout";
import CountUp from "./CountUp";
import { Clock, Mic, Target, Flame, BookOpen, Zap, Heart, Users, Trophy, TrendingDown, MessageCircle, Volume2 } from "lucide-react";

// ============ PATIENT SLIDES ============

export function SlideIntro({ name, year }: { name: string; year: number }) {
  return (
    <SlideLayout gradient="from-[#0f172a] via-[#164e63] to-[#0f172a]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-6xl mb-4">🎙️</div>
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-3xl font-bold leading-tight"
      >
        Votre année
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">RespirFacile {year}</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-white/60 text-lg"
      >
        {name}, installez-vous confortablement.
        <br />
        <span className="text-white/40 text-sm">On a compté pour vous.</span>
      </motion.p>
    </SlideLayout>
  );
}

function getFunTimeComparison(totalHours: number): string {
  if (totalHours < 1) return `Soit environ ${Math.round(totalHours * 60)} minutes. C'est déjà un début ! 🌱`;
  if (totalHours < 3) return `C'est comme regarder la trilogie du Seigneur des Anneaux. En version longue. 🧙‍♂️`;
  if (totalHours < 8) return `Soit un vol Paris → New York passé à articuler au lieu de dormir ✈️`;
  if (totalHours < 15) return `L'équivalent d'une nuit blanche entière à parler. Mais en mieux réparti. 😴`;
  if (totalHours < 30) return `Vous avez parlé plus longtemps qu'un marathon de discours politiques. Et en mieux. 🎤`;
  return `Plus de ${Math.round(totalHours)}h… Vous pourriez enregistrer votre propre podcast ! 🎧`;
}

export function SlideTime({ totalHours, equivalentEpisodes }: { totalHours: number; equivalentEpisodes: number }) {
  return (
    <SlideLayout gradient="from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
      <Clock className="w-12 h-12 text-indigo-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Temps d'entraînement</p>
      <div className="text-6xl font-black">
        <CountUp end={totalHours} decimals={1} suffix="h" />
      </div>
      <p className="text-white/50 text-base mt-4 leading-relaxed">
        {getFunTimeComparison(totalHours)}
      </p>
    </SlideLayout>
  );
}

export function SlideProgress({ avgSpsFirst, avgSpsLast }: { avgSpsFirst: number; avgSpsLast: number }) {
  const improved = avgSpsFirst > avgSpsLast;
  const diff = Math.abs(Math.round((avgSpsFirst - avgSpsLast) * 10) / 10);
  return (
    <SlideLayout gradient="from-[#064e3b] via-[#065f46] to-[#064e3b]">
      <TrendingDown className="w-12 h-12 text-emerald-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Votre rythme a changé</p>
      <div className="flex items-center gap-4 text-4xl font-black mt-2">
        <div className="text-center">
          <span className="text-white/50">{avgSpsFirst}</span>
          <p className="text-xs text-white/30 font-normal mt-1">début</p>
        </div>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-emerald-300 text-3xl"
        >→</motion.span>
        <div className="text-center">
          <span className="text-emerald-300">{avgSpsLast}</span>
          <p className="text-xs text-emerald-300/50 font-normal mt-1">maintenant</p>
        </div>
      </div>
      <p className="text-sm text-white/40 mt-1">score respiratoire</p>
      {improved ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-emerald-300 text-lg font-medium mt-4"
        >
          Votre score s'est amélioré de {diff} pts.
          <br />
          <span className="text-emerald-200/70 text-base">C'est exactement le but du jeu 🎯</span>
        </motion.p>
      ) : (
        <p className="text-white/50 text-base mt-4">
          Rome ne s'est pas construite en un jour.
          <br />
          <span className="text-white/40">Chaque séance compte 💪</span>
        </p>
      )}
    </SlideLayout>
  );
}

const exerciseLabels: Record<string, { label: string; emoji: string; funFact: string }> = {
  reading: { label: "Lecture", emoji: "📖", funFact: "Le grand classique. Simple, efficace, redoutable." },
  slow_reading: { label: "Lecture lente", emoji: "🐢", funFact: "Mode tortue activé. La lenteur est un super-pouvoir." },
  articulation: { label: "Régularité", emoji: "🫁", funFact: "Chaque séance compte. Vous le savez mieux que personne." },
  improvisation: { label: "Improvisation", emoji: "🎤", funFact: "Parler sans filet, mais avec contrôle. Chapeau." },
  dialogue: { label: "Dialogue", emoji: "💬", funFact: "La vraie vie, en mode entraînement." },
  rebus: { label: "Rébus", emoji: "🧩", funFact: "Le cerveau qui joue et la bouche qui suit." },
  warmup: { label: "Échauffement", emoji: "🔥", funFact: "Comme un sportif avant le match. Pro." },
  retelling: { label: "Reformulation", emoji: "🔄", funFact: "Raconter avec ses mots. Plus dur qu'il n'y paraît." },
  live_session: { label: "Séance live", emoji: "🎧", funFact: "En direct avec votre orthophoniste !" },
};

export function SlideFavorite({ favoriteExercise }: { favoriteExercise: string }) {
  const info = exerciseLabels[favoriteExercise] || { label: favoriteExercise, emoji: "📝", funFact: "Un exercice de choix !" };
  return (
    <SlideLayout gradient="from-[#7c2d12] via-[#9a3412] to-[#7c2d12]">
      <motion.div
        initial={{ rotate: -20, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="text-6xl"
      >
        {info.emoji}
      </motion.div>
      <p className="text-white/60 text-sm uppercase tracking-widest">Votre exercice préféré</p>
      <h2 className="text-3xl font-bold text-orange-200">{info.label}</h2>
      <p className="text-white/50 text-base mt-2 italic">"{info.funFact}"</p>
    </SlideLayout>
  );
}

export function SlideStreak({ bestStreak, activeDays }: { bestStreak: number; activeDays: number }) {
  const streakMessage = bestStreak >= 14
    ? "Impressionnant. Même Duolingo serait jaloux. 🦉"
    : bestStreak >= 7
      ? "Une semaine sans lâcher. Solide. 💪"
      : bestStreak >= 3
        ? "Trois jours d'affilée, c'est déjà une habitude qui se forme !"
        : "Chaque jour compte. La régularité viendra !";

  return (
    <SlideLayout gradient="from-[#78350f] via-[#92400e] to-[#78350f]">
      <Flame className="w-12 h-12 text-amber-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Régularité</p>
      <div className="text-5xl font-black text-amber-200">
        <CountUp end={bestStreak} />
      </div>
      <p className="text-amber-300/70 text-lg">jours d'affilée 🔥</p>
      <p className="text-white/50 text-sm mt-3 italic">{streakMessage}</p>
      <div className="mt-6 px-6 py-3 bg-white/5 rounded-2xl">
        <p className="text-amber-100 text-xl font-bold">
          <CountUp end={activeDays} /> <span className="text-base font-normal text-white/50">jours actifs en {new Date().getFullYear()}</span>
        </p>
      </div>
    </SlideLayout>
  );
}

function formatBigNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function SlideWords({ totalWords, totalSyllables }: { totalWords: number; totalSyllables: number }) {
  const wordComparison = totalWords > 50000
    ? "C'est un roman entier. Vous êtes presque auteur."
    : totalWords > 20000
      ? "L'équivalent d'un mémoire de master. En parlant."
      : totalWords > 5000
        ? "Plus que le discours de De Gaulle du 18 juin. Avec de meilleures pauses."
        : "Chaque mot compte quand on le dit bien.";

  return (
    <SlideLayout gradient="from-[#1e3a5f] via-[#1e40af] to-[#1e3a5f]">
      <Volume2 className="w-12 h-12 text-blue-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Votre bouche a travaillé</p>
      <div className="space-y-3 mt-2">
        <div>
          <div className="text-5xl font-black text-blue-200">
            {totalWords >= 1000 ? formatBigNumber(totalWords) : <CountUp end={totalWords} />}
          </div>
          <p className="text-white/50 text-sm">mots prononcés</p>
        </div>
        <div className="w-12 h-px bg-white/10 mx-auto" />
        <div>
          <div className="text-3xl font-bold text-blue-300/80">
            {totalSyllables >= 1000 ? formatBigNumber(totalSyllables) : <CountUp end={totalSyllables} />}
          </div>
          <p className="text-white/40 text-sm">cycles respiratoires</p>
        </div>
      </div>
      <p className="text-white/40 text-sm mt-4 italic">{wordComparison}</p>
    </SlideLayout>
  );
}

export function SlideTooFast({ tooFastCount, totalSessions }: { tooFastCount: number; totalSessions: number }) {
  const pct = totalSessions > 0 ? Math.round((1 - tooFastCount / totalSessions) * 100) : 0;

  const tooFastMessage = tooFastCount === 0
    ? "Zéro dépassement. Vous êtes un robot de la lenteur. 🤖"
    : tooFastCount <= 3
      ? "Presque parfait. Quelques petits excès de vitesse. Pas d'amende. 🚗"
      : pct >= 70
        ? "Quelques accélérations, mais vous gardez le cap ! 🧭"
        : "Le compteur s'emballe parfois. On va travailler ça ensemble. 😄";

  return (
    <SlideLayout gradient="from-[#4a1942] via-[#6b2164] to-[#4a1942]">
      <Zap className="w-12 h-12 text-fuchsia-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Excès de vitesse</p>
      <div className="text-5xl font-black text-fuchsia-200">
        <CountUp end={tooFastCount} />
      </div>
      <p className="text-white/50 text-base">
        {tooFastCount === 1 ? "séance au-dessus de la cible" : "séances au-dessus de la cible"}
      </p>
      <div className="mt-4 px-6 py-3 bg-white/5 rounded-2xl">
        <p className="text-fuchsia-200 text-xl font-bold">{pct}% dans la cible</p>
      </div>
      <p className="text-white/40 text-sm mt-3 italic">{tooFastMessage}</p>
    </SlideLayout>
  );
}

export function SlideFun({ equivalentPages, totalHours }: { equivalentPages: number; totalHours: number }) {
  // Pick the most fun comparison based on the hours
  const funFacts = [
    { threshold: 0, text: `${equivalentPages} pages de roman lues à voix haute`, emoji: "📚" },
    { threshold: 2, text: `${Math.round(totalHours * 60 / 3.5)} chansons de Céline Dion chantées (lentement)`, emoji: "🎵" },
    { threshold: 5, text: `${Math.round(totalHours * 12)} tasses de thé bues pendant vos séances (estimation)`, emoji: "🍵" },
  ];

  const applicableFacts = funFacts.filter(f => totalHours >= f.threshold);
  const fact = applicableFacts[applicableFacts.length - 1] || funFacts[0];

  return (
    <SlideLayout gradient="from-[#0c4a6e] via-[#0369a1] to-[#0c4a6e]">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-5xl"
      >
        {fact.emoji}
      </motion.div>
      <p className="text-white/60 text-sm uppercase tracking-widest">Stat inutile (mais vraie)</p>
      <p className="text-2xl font-bold text-sky-100 mt-2 leading-relaxed">
        {fact.text}
      </p>
      <p className="text-white/30 text-xs mt-4">
        * Calculs approximatifs. Aucun roman n'a été maltraité.
      </p>
    </SlideLayout>
  );
}

export function SlideThanks({ year }: { year: number }) {
  return (
    <SlideLayout gradient="from-[#0f172a] via-[#164e63] to-[#0f172a]">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.3 }}
      >
        <Heart className="w-16 h-16 text-teal-300" />
      </motion.div>
      <h2 className="text-2xl font-bold">Merci d'avoir été là 💚</h2>
      <p className="text-white/60 text-base leading-relaxed">
        Parler moins vite, c'est pas facile.
        <br />
        Mais vous l'avez fait, séance après séance.
      </p>
      <p className="text-white/40 text-sm mt-4">
        On se retrouve en {year + 1} ?
      </p>
    </SlideLayout>
  );
}

// ============ THERAPIST SLIDES ============

export function SlideTherapistIntro({ name, year }: { name: string; year: number }) {
  return (
    <SlideLayout gradient="from-[#0f172a] via-[#164e63] to-[#0f172a]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="text-6xl mb-4">🩺</div>
      </motion.div>
      <h1 className="text-3xl font-bold leading-tight">
        Votre année
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">RespirFacile Pro {year}</span>
      </h1>
      <p className="text-white/60 text-lg">
        {name}, on a fait les comptes.
        <br />
        <span className="text-white/40 text-sm">Spoiler : vous avez bien bossé.</span>
      </p>
    </SlideLayout>
  );
}

export function SlideTherapistImpact({ totalPatients }: { totalPatients: number }) {
  const impactMessage = totalPatients >= 10
    ? "Votre cabinet tourne à plein régime ! 🏥"
    : totalPatients >= 5
      ? "Une belle patientèle. Chacun progresse grâce à vous."
      : "Chaque patient compte. Qualité > quantité.";

  return (
    <SlideLayout gradient="from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
      <Users className="w-12 h-12 text-indigo-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Votre impact</p>
      <div className="text-6xl font-black text-indigo-200">
        <CountUp end={totalPatients} />
      </div>
      <p className="text-white/50 text-lg">
        {totalPatients === 1 ? "patient accompagné" : "patients accompagnés"}
      </p>
      <p className="text-white/40 text-sm mt-3 italic">{impactMessage}</p>
    </SlideLayout>
  );
}

export function SlideTherapistVolume({ totalSessions, totalHours }: { totalSessions: number; totalHours: number }) {
  return (
    <SlideLayout gradient="from-[#064e3b] via-[#065f46] to-[#064e3b]">
      <Mic className="w-12 h-12 text-emerald-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Vos patients ont réalisé</p>
      <div className="text-5xl font-black text-emerald-200">
        <CountUp end={totalSessions} />
      </div>
      <p className="text-white/50">séances d'entraînement</p>
      <div className="mt-4 px-6 py-3 bg-white/5 rounded-2xl">
        <p className="text-emerald-300 text-lg font-medium">
          <CountUp end={totalHours} decimals={1} suffix="h" /> de pratique
        </p>
      </div>
      <p className="text-white/40 text-sm mt-3 italic">
        Et ça, c'est grâce à votre suivi. 👏
      </p>
    </SlideLayout>
  );
}

export function SlideTherapistChampion({ championName, championSessions }: { championName: string; championSessions: number }) {
  return (
    <SlideLayout gradient="from-[#78350f] via-[#92400e] to-[#78350f]">
      <Trophy className="w-12 h-12 text-amber-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Le ou la plus assidu·e</p>
      <h2 className="text-3xl font-bold text-amber-200">{championName}</h2>
      <div className="mt-2">
        <span className="text-4xl font-black text-amber-100"><CountUp end={championSessions} /></span>
        <span className="text-white/50 text-lg ml-2">séances 🏆</span>
      </div>
      <p className="text-white/40 text-sm mt-3 italic">
        On ne sait pas si c'est grâce à vous ou à la gamification. Probablement les deux.
      </p>
    </SlideLayout>
  );
}

export function SlideTherapistProgress({ avgImprovement }: { avgImprovement: number }) {
  const progressMessage = avgImprovement >= 20
    ? "Des résultats spectaculaires. Vos patients vous doivent beaucoup."
    : avgImprovement >= 10
      ? "Une belle progression collective. Le suivi régulier paie."
      : avgImprovement > 0
        ? "Chaque pourcentage compte en rééducation."
        : "Les résultats ne sont pas toujours linéaires. Courage !";

  return (
    <SlideLayout gradient="from-[#4a1942] via-[#6b2164] to-[#4a1942]">
      <Target className="w-12 h-12 text-fuchsia-300 mb-2" />
      <p className="text-white/60 text-sm uppercase tracking-widest">Progression moyenne</p>
      <div className="text-6xl font-black text-fuchsia-200">
        <CountUp end={avgImprovement} suffix="%" />
      </div>
      <p className="text-white/50 text-lg">d'amélioration du débit</p>
      <p className="text-white/40 text-sm mt-3 italic">{progressMessage}</p>
    </SlideLayout>
  );
}

export function SlideTherapistFun({ totalSyllables }: { totalSyllables: number }) {
  const millions = Math.round(totalSyllables / 100000) / 10;

  const funComparison = totalSyllables > 1000000
    ? "C'est plus que les paroles de toute la discographie de Stromae. 🎵"
    : totalSyllables > 500000
      ? "L'équivalent du texte de 3 Harry Potter lus à voix haute. 🧙"
      : totalSyllables > 100000
        ? "Presque autant de cycles que dans un marathon de yoga. Mais en plus utile. ⚖️"
        : "Chaque séance complétée est un pas vers une meilleure respiration. 🚶";

  return (
    <SlideLayout gradient="from-[#0c4a6e] via-[#0369a1] to-[#0c4a6e]">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-5xl"
      >
        🗣️
      </motion.div>
      <p className="text-white/60 text-sm uppercase tracking-widest">Stat inutile (mais vraie)</p>
      <p className="text-2xl font-bold text-sky-100">
        Vos patients ont complété
      </p>
      <div className="text-5xl font-black text-sky-200">
        {millions >= 1 ? (
          <><CountUp end={millions} decimals={1} /> millions</>
        ) : (
          <><CountUp end={totalSyllables} /> <span className="text-2xl">cycles</span></>
        )}
      </div>
      <p className="text-white/40 text-sm mt-3 italic">{funComparison}</p>
      <p className="text-white/20 text-xs mt-2">* Calcul approximatif. Aucun cycle n'a été maltraité.</p>
    </SlideLayout>
  );
}

export function SlideTherapistThanks({ year }: { year: number }) {
  return (
    <SlideLayout gradient="from-[#0f172a] via-[#164e63] to-[#0f172a]">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.3 }}
      >
        <Heart className="w-16 h-16 text-teal-300" />
      </motion.div>
      <h2 className="text-2xl font-bold">Merci pour tout 💚</h2>
      <p className="text-white/60 text-base leading-relaxed">
        RespirFacile existe parce que des orthophonistes comme vous y croient.
        <br />
        Vos patients progressent, et vous y êtes pour beaucoup.
      </p>
      <p className="text-white/40 text-sm mt-4">
        Rendez-vous en {year + 1} pour de nouvelles aventures. 🚀
      </p>
    </SlideLayout>
  );
}
