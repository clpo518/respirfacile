import { BookOpen, Mic, Gauge, Dumbbell, RotateCcw, Brain, Timer } from "lucide-react";

export type ExerciseTypeKey = 'reading' | 'improvisation' | 'warmup' | 'repetition' | 'live_session' | 'neurologie' | 'retelling' | 'latence';

interface ExerciseTypeMeta {
  label: string;
  icon: React.ReactNode;
  className: string;
}

const EXERCISE_TYPE_MAP: Record<ExerciseTypeKey, ExerciseTypeMeta> = {
  reading: {
    label: "Lecture",
    icon: <BookOpen className="w-2.5 h-2.5" />,
    className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  improvisation: {
    label: "Oral libre",
    icon: <Mic className="w-2.5 h-2.5" />,
    className: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  },
  warmup: {
    label: "Échauffement",
    icon: <Dumbbell className="w-2.5 h-2.5" />,
    className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  },
  repetition: {
    label: "Répétition",
    icon: <RotateCcw className="w-2.5 h-2.5" />,
    className: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  },
  live_session: {
    label: "En séance",
    icon: <Gauge className="w-2.5 h-2.5" />,
    className: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  },
  neurologie: {
    label: "Neurologie",
    icon: <Brain className="w-2.5 h-2.5" />,
    className: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  },
  retelling: {
    label: "Récit résumé",
    icon: <BookOpen className="w-2.5 h-2.5" />,
    className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  },
  latence: {
    label: "Temps de latence",
    icon: <Timer className="w-2.5 h-2.5" />,
    className: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  },
};

export function getExerciseTypeMeta(exerciseType: string | null | undefined): ExerciseTypeMeta {
  if (exerciseType && exerciseType in EXERCISE_TYPE_MAP) {
    return EXERCISE_TYPE_MAP[exerciseType as ExerciseTypeKey];
  }
  return EXERCISE_TYPE_MAP.reading; // fallback
}

export function ExerciseTypeBadge({ exerciseType }: { exerciseType: string | null | undefined }) {
  const { label, icon, className } = getExerciseTypeMeta(exerciseType);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${className}`}>
      {icon}
      {label}
    </span>
  );
}
