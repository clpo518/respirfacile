"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface Exercise {
  id: string
  name_fr: string
  category: string
  duration_seconds: number
  difficulty: 1 | 2 | 3
  description?: string
}

const CATEGORY_EMOJIS: Record<string, string> = {
  pause_controlee: "🫁",
  coherence_cardiaque: "💓",
  respiration_nasale: "👃",
  myofonctionnel: "👅",
  diaphragmatique: "🌬️",
  relaxation: "🧘",
}

export default function NextExercise({ exercise }: { exercise: Exercise }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const emoji = CATEGORY_EMOJIS[exercise.category] || "🌬️"
  const difficultyStars = "★".repeat(exercise.difficulty) + "☆".repeat(3 - exercise.difficulty)
  const duration =
    exercise.duration_seconds < 60
      ? `${exercise.duration_seconds}s`
      : `${Math.round(exercise.duration_seconds / 60)}m`

  return (
    <>
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-emoji { animation: float-up 3s ease-in-out infinite; }
      `}</style>
      <Link href={`/session/${exercise.id}`} className="block w-full">
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-[#2D5016] p-8 mb-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="text-6xl float-emoji">{emoji}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                Prochain exercice
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">{exercise.name_fr}</h2>
              {exercise.description && (
                <p className="text-sm text-white/80 mb-3 line-clamp-2">{exercise.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-sm">⏱️</span>
                  <span className="text-xs font-medium text-white">{duration}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-xs text-yellow-300 tracking-widest">{difficultyStars}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 group-hover:bg-[#8B4513] flex items-center justify-center transition-all duration-300">
              <span className="text-xl text-white">→</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B4513] via-[#8B4513]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </>
  )
}
