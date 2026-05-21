"use client"

import { useState } from "react"
import Link from "next/link"

type Profile = "apnees" | "respiration" | "both" | "unrelated" | null

const QUESTIONS = [
  { id: "snoring",  text: "Votre entourage vous dit que vous ronflez fort la nuit ?" },
  { id: "tired",    text: "Vous vous reveillez fatigue(e) meme apres une nuit entiere ?" },
  { id: "mouth",    text: "Vous respirez surtout par la bouche (le jour ou la nuit) ?" },
  { id: "jaw",      text: "Vous avez des douleurs a la machoire ou vous serrez les dents ?" },
  { id: "pro",      text: "Un medecin ou specialiste vous a parle d'exercices de respiration ?" },
]

const RESULTS: Record<NonNullable<Profile>, { title: string; desc: string; ctaPro: string; ctaPatient: string }> = {
  apnees: {
    title: "Vous pourriez beneficier d'une reeducation respiratoire",
    desc: "Vos reponses indiquent des signes d'apnees du sommeil. Un orthophoniste ou un kinesitherapeute peut vous prescrire un programme d'exercices guide. Parlez-en a votre medecin.",
    ctaPro: "Je suis praticien, essayer Respirfacile",
    ctaPatient: "Mon praticien m'a deja donne un code",
  },
  respiration: {
    title: "Des exercices de respiration pourraient vous aider",
    desc: "Vos reponses indiquent une respiration buccale ou une mauvaise posture. Un specialiste peut vous guider avec des exercices quotidiens simples.",
    ctaPro: "Je suis praticien, essayer Respirfacile",
    ctaPatient: "Mon praticien m'a deja donne un code",
  },
  both: {
    title: "Vous combinez plusieurs symptomes courants",
    desc: "Ronflements, fatigue, respiration buccale : c'est fréquent et tout à fait traitable. Parlez-en à votre médecin ou consultez un orthophoniste.",
    ctaPro: "Je suis praticien, essayer Respirfacile",
    ctaPatient: "Mon praticien m'a deja donne un code",
  },
  unrelated: {
    title: "Respirfacile est peut-etre moins adapte",
    desc: "Vos reponses n'indiquent pas clairement de probleme respiratoire. Consultez un medecin pour un bilan. Si un specialiste vous prescrit des exercices, revenez nous voir.",
    ctaPro: "Je suis praticien, en savoir plus",
    ctaPatient: "J'ai quand meme un code praticien",
  },
}

function computeProfile(answers: Record<string, boolean>): NonNullable<Profile> {
  const apneesScore = (answers.snoring ? 1 : 0) + (answers.tired ? 1 : 0)
  const respirationScore = (answers.mouth ? 1 : 0) + (answers.jaw ? 1 : 0) + (answers.pro ? 1 : 0)
  if (apneesScore >= 1 && respirationScore >= 1) return "both"
  if (apneesScore >= 1) return "apnees"
  if (respirationScore >= 1) return "respiration"
  return "unrelated"
}

export function ScreeningQuiz() {
  const [phase, setPhase] = useState<"quiz" | "result">("quiz")
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [profile, setProfile] = useState<Profile>(null)

  const handleAnswer = (yes: boolean) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: yes }
    setAnswers(newAnswers)
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setProfile(computeProfile(newAnswers))
      setPhase("result")
    }
  }

  const reset = () => {
    setAnswers({})
    setCurrentQ(0)
    setPhase("quiz")
    setProfile(null)
  }

  const progressPct = ((currentQ) / QUESTIONS.length) * 100
  const q = QUESTIONS[currentQ]

  if (phase === "result" && profile) {
    const result = RESULTS[profile]
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-sm overflow-hidden">
          <div className="bg-[#2D5016] p-6 text-center">
            <div className="text-4xl mb-2">💡</div>
            <h3 className="text-xl font-bold text-white">{result.title}</h3>
          </div>
          <div className="p-8 text-center">
            <p className="text-forest-600 leading-relaxed mb-8">{result.desc}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth?mode=signup&role=therapist"
                className="block w-full bg-[#2D5016] hover:bg-[#1e3a0f] text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                {result.ctaPro} →
              </Link>
              <Link
                href="/auth?mode=signup&role=patient"
                className="block w-full bg-beige-200 hover:bg-beige-300 text-forest-700 font-semibold py-4 rounded-2xl transition-colors text-sm"
              >
                {result.ctaPatient}
              </Link>
            </div>
            <button onClick={reset} className="text-xs text-forest-400 hover:text-forest-600 transition-colors mt-4 block mx-auto">
              Recommencer le test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-beige-200">
          <div
            className="h-full bg-[#2D5016] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="p-8">
          <p className="text-xs text-forest-400 mb-6">Question {currentQ + 1} / {QUESTIONS.length}</p>
          <h3 className="text-xl font-semibold text-forest-800 mb-8 leading-snug">{q.text}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 bg-[#2D5016] hover:bg-[#1e3a0f] text-white font-semibold rounded-2xl transition-colors text-sm"
            >
              Oui
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 bg-beige-200 hover:bg-beige-300 text-forest-700 font-semibold rounded-2xl transition-colors text-sm"
            >
              Non
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
