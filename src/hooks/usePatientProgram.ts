import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { PatientProgramRow, SessionRow } from "@/integrations/supabase/types"
import { PROGRAM_TEMPLATES, getExerciseById } from "@/data/exercises"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TodayExercise {
  id: string
  name_fr: string
  description_fr: string
  duration_seconds: number
  icon: string
  category: string
  completed: boolean
}

export interface WeekDay {
  date: Date
  label: string   // "L", "M", "M", "J", "V", "S", "D"
  completed: boolean
  isJoker: boolean
  isToday: boolean
  isFuture: boolean
}

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────

export function usePatientProgram() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // ── Programme actif ──────────────────────────
  const {
    data: program,
    isLoading: programLoading,
    error: programError,
  } = useQuery({
    queryKey: ["patient_program", user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from("patient_programs")
        .select("*")
        .eq("patient_id", user.id)
        .eq("is_active", true)
        .maybeSingle()
      if (error) throw error
      return data as PatientProgramRow | null
    },
    enabled: !!user,
  })

  // ── Sessions de cette semaine ────────────────
  const {
    data: weekSessions,
    isLoading: sessionsLoading,
  } = useQuery({
    queryKey: ["week_sessions", user?.id],
    queryFn: async () => {
      if (!user) return []
      const startOfWeek = getStartOfWeek()
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("created_at", startOfWeek.toISOString())
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as SessionRow[]
    },
    enabled: !!user,
  })

  // ── Dernières sessions (historique) ──────────
  const {
    data: recentSessions,
    isLoading: recentLoading,
  } = useQuery({
    queryKey: ["recent_sessions", user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []) as SessionRow[]
    },
    enabled: !!user,
  })

  // ── Exercices du jour ────────────────────────
  const todayExercises: TodayExercise[] = (() => {
    if (!program) return []

    const profileType = program.profile_type as keyof typeof PROGRAM_TEMPLATES
    const template = PROGRAM_TEMPLATES[profileType]
    if (!template) return []

    const exerciseIds: string[] = template.exerciseIds ?? []

    // Exercices déjà faits aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = new Set(
      (weekSessions ?? [])
        .filter(s => new Date(s.created_at) >= today)
        .map(s => s.exercise_id)
    )

    return exerciseIds.map(id => {
      const ex = getExerciseById(id)
      return {
        id,
        name_fr: ex?.name_fr ?? id,
        description_fr: ex?.description_fr ?? "",
        duration_seconds: ex?.duration_seconds ?? 300,
        icon: ex?.icon ?? "🫁",
        category: ex?.category ?? "",
        completed: completedToday.has(id),
      }
    })
  })()

  // ── Tracker de la semaine (7 jours) ─────────
  const weekDays: WeekDay[] = (() => {
    const labels = ["L", "M", "M", "J", "V", "S", "D"]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfWeek = getStartOfWeek()

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      // A-t-on fait au moins 1 séance ce jour ?
      const hasSession = (weekSessions ?? []).some(s => {
        const d = new Date(s.created_at)
        return d >= date && d < nextDay
      })

      // Est-ce un jour joker (passé sans séance, mais joker utilisé) ?
      // Simplifié : si c'est passé et pas de séance → joker possible
      const isPast = date < today
      const isToday = date.getTime() === today.getTime()
      const isFuture = date > today

      return {
        date,
        label: labels[i],
        completed: hasSession,
        isJoker: isPast && !hasSession && !isToday,
        isToday,
        isFuture,
      }
    })
  })()

  // ── Statistiques rapides ─────────────────────
  const stats = {
    sessionsThisWeek: weekSessions?.length ?? 0,
    totalSessions: recentSessions?.length ?? 0,
    currentWeek: program?.week_number ?? 1,
    jokersUsed: program?.jokers_used ?? 0,
    jokersLeft: Math.max(0, 2 - (program?.jokers_used ?? 0)),
    profileType: program?.profile_type ?? null,
    completionToday: todayExercises.length > 0
      ? Math.round((todayExercises.filter(e => e.completed).length / todayExercises.length) * 100)
      : 0,
  }

  // ── Créer un programme ───────────────────────
  const createProgram = useMutation({
    mutationFn: async (profileType: string) => {
      if (!user) throw new Error("Not authenticated")
      const { data, error } = await supabase
        .from("patient_programs")
        .insert({
          patient_id: user.id,
          profile_type: profileType as PatientProgramRow["profile_type"],
          week_number: 1,
          jokers_used: 0,
          is_active: true,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient_program", user?.id] })
    },
  })

  // ── Enregistrer une séance ───────────────────
  const saveSession = useMutation({
    mutationFn: async (params: {
      exerciseId: string
      exerciseCategory: string
      durationSeconds: number
      score?: number
      metrics?: Record<string, unknown>
      notes?: string
    }) => {
      if (!user) throw new Error("Not authenticated")
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          program_id: program?.id ?? null,
          exercise_id: params.exerciseId,
          exercise_category: params.exerciseCategory,
          duration_seconds: params.durationSeconds,
          completed: true,
          score: params.score ?? null,
          metrics: params.metrics ?? {},
          notes: params.notes ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week_sessions", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["recent_sessions", user?.id] })
    },
  })

  // ── Avancer d'une semaine ────────────────────
  const advanceWeek = useMutation({
    mutationFn: async () => {
      if (!program) throw new Error("No active program")
      const { error } = await supabase
        .from("patient_programs")
        .update({ week_number: program.week_number + 1 })
        .eq("id", program.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient_program", user?.id] })
    },
  })

  return {
    program,
    programLoading,
    programError,
    todayExercises,
    weekDays,
    weekSessions: weekSessions ?? [],
    recentSessions: recentSessions ?? [],
    sessionsLoading,
    stats,
    createProgram,
    saveSession,
    advanceWeek,
    isLoading: programLoading || sessionsLoading,
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay() // 0=dim, 1=lun, ...
  const diff = day === 0 ? -6 : 1 - day  // on veut lundi
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}
