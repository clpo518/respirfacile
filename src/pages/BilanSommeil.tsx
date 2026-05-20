import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Wind, ArrowRight, ChevronRight, Moon } from "lucide-react"

const ESS_QUESTIONS = [
  { question: "Assis en train de lire", emoji: "📖" },
  { question: "En regardant la télévision", emoji: "📺" },
  { question: "Assis, inactif dans un lieu public (cinéma, réunion)", emoji: "🪑" },
  { question: "Comme passager en voiture pendant 1 heure sans arrêt", emoji: "🚗" },
  { question: "Allongé pour vous reposer l'après-midi quand vous en avez l'occasion", emoji: "🛋️" },
  { question: "Assis en train de parler avec quelqu'un", emoji: "💬" },
  { question: "Assis tranquillement après un repas sans alcool", emoji: "🍽️" },
  { question: "En voiture, stoppé quelques minutes dans un embouteillage", emoji: "🚦" },
]

const ESS_OPTIONS = [
  { label: "Jamais", value: 0 },
  { label: "Rarement", value: 1 },
  { label: "Parfois", value: 2 },
  { label: "Souvent", value: 3 },
]

export default function BilanSommeil() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<number[]>(Array(8).fill(-1))
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = answers.every(a => a >= 0)
  const totalScore  = answers.reduce((s, a) => s + Math.max(0, a), 0)

  const result = submitted
    ? totalScore >= 16 ? {
        level: "Somnolence sévère",
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        icon: "🚨",
        text: "Votre score indique une somnolence diurne excessive. Ce résultat est compatible avec un syndrome d'apnées obstructives du sommeil modéré à sévère. Consultez un spécialiste du sommeil et parlez de la rééducation myofonctionnelle à votre orthophoniste.",
        profile: "adult_saos_severe",
      }
    : totalScore >= 11 ? {
        level: "Somnolence modérée",
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        icon: "⚠️",
        text: "Votre score reflète une somnolence diurne modérée. Des troubles du sommeil, potentiellement liés à un SAOS léger, peuvent expliquer cette fatigue. Un programme de rééducation respiratoire peut améliorer significativement votre qualité de sommeil.",
        profile: "adult_saos_mild",
      }
    : totalScore >= 6 ? {
        level: "Somnolence légère",
        color: "text-sky-600",
        bg: "bg-sky-50 border-sky-200",
        icon: "🌙",
        text: "Votre somnolence est légèrement au-dessus de la normale. Des exercices respiratoires préventifs peuvent améliorer la qualité de votre sommeil et renforcer vos voies aériennes.",
        profile: "adult_saos_mild",
      }
    : {
        level: "Somnolence normale",
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
        icon: "✅",
        text: "Votre niveau de somnolence est dans la normale. Si vous ronflez ou si votre entourage signale des pauses respiratoires, des exercices myofonctionnels peuvent toutefois prévenir l'aggravation.",
        profile: "adult_tmof",
      }
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-sm px-4 py-2">
            Commencer
          </button>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 mb-4">
              <Moon className="w-3 h-3" />
              Test de somnolence validé
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground font-bold leading-tight mb-3">
              Évaluez votre<br />qualité de sommeil
            </h1>
            <p className="text-muted-foreground text-lg">
              8 questions · 2 minutes · résultat immédiat.<br />
              Basé sur l'Échelle de Somnolence d'Epworth (ESS).
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <p className="text-sm text-center text-muted-foreground font-medium">
                  Dans chaque situation, quelle est la probabilité que vous vous endormiez ?
                </p>

                {ESS_QUESTIONS.map((q, qi) => (
                  <motion.div
                    key={qi}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: qi * 0.04 }}
                    className="card-rf p-4"
                  >
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <span className="text-xl">{q.emoji}</span>
                      {q.question}
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ESS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setAnswers(prev => { const n = [...prev]; n[qi] = opt.value; return n })}
                          className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                            answers[qi] === opt.value
                              ? "bg-primary text-white border-primary"
                              : "bg-card border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: allAnswered ? 1 : 0.4 }}
                  onClick={() => allAnswered && setSubmitted(true)}
                  disabled={!allAnswered}
                  className="w-full btn-forest py-4 text-base font-semibold gap-2"
                >
                  Voir mon résultat
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {!allAnswered && (
                  <p className="text-center text-xs text-muted-foreground">
                    {answers.filter(a => a >= 0).length}/8 questions complétées
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                {result && (
                  <>
                    {/* Score */}
                    <div className={`card-rf p-6 text-center border ${result.bg}`}>
                      <span className="text-5xl block mb-3">{result.icon}</span>
                      <p className="text-sm text-muted-foreground mb-1">Score ESS : {totalScore}/24</p>
                      <h2 className={`font-display text-2xl font-bold mb-3 ${result.color}`}>
                        {result.level}
                      </h2>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {result.text}
                      </p>
                    </div>

                    {/* Ce que ça signifie */}
                    <div className="card-rf p-5 space-y-3">
                      <p className="text-sm font-semibold text-foreground">Ce que vous pouvez faire maintenant</p>
                      {[
                        "Commencer un programme de rééducation respiratoire adapté à votre profil",
                        "Travailler avec un orthophoniste spécialisé en SAOS et troubles myofonctionnels",
                        "Suivre votre progression avec un bilan toutes les 4 semaines",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                            <ChevronRight className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-sm text-foreground/80">{item}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => navigate(`/auth?tab=signup`)}
                      className="w-full btn-forest py-4 text-base font-semibold gap-2"
                    >
                      Commencer mon programme gratuit
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSubmitted(false); setAnswers(Array(8).fill(-1)) }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2"
                    >
                      Refaire le test
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground mt-8 px-4 leading-relaxed">
            Ce test est à titre indicatif uniquement. Il ne remplace pas un diagnostic médical.
            En cas de doute, consultez votre médecin ou un spécialiste du sommeil.
          </p>
        </div>
      </main>
    </div>
  )
}
