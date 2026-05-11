import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityHeatmapProps {
  userId: string
  days?: number
}

function getLastNDates(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-muted"
  if (count <= 2) return "bg-primary/25"
  if (count <= 4) return "bg-primary/60"
  return "bg-primary"
}

export function ActivityHeatmap({ userId, days = 30 }: ActivityHeatmapProps) {
  const dates = getLastNDates(days)
  const since = dates[0] + "T00:00:00.000Z"

  const { data: rows = [] } = useQuery({
    queryKey: ["activity_heatmap", userId, days],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("created_at")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("created_at", since)
      return data ?? []
    },
    enabled: !!userId,
  })

  const countByDate: Record<string, number> = {}
  for (const s of rows) {
    const day = (s.created_at as string).slice(0, 10)
    countByDate[day] = (countByDate[day] ?? 0) + 1
  }

  const totalActiveDays = Object.values(countByDate).filter(c => c > 0).length
  const totalSessions = Object.values(countByDate).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Activité — {days} derniers jours
        </p>
        <p className="text-xs text-muted-foreground">
          {totalActiveDays} jour{totalActiveDays !== 1 ? "s" : ""} · {totalSessions} séance{totalSessions !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const count = countByDate[date] ?? 0
          const label = new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
          return (
            <Tooltip key={date}>
              <TooltipTrigger asChild>
                <div
                  className={`w-5 h-5 rounded-sm cursor-default transition-colors ${intensityClass(count)}`}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {label} · {count} séance{count !== 1 ? "s" : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-muted-foreground">Moins</span>
        {[0, 1, 3, 5].map((v) => (
          <div key={v} className={`w-3 h-3 rounded-sm ${intensityClass(v)}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">Plus</span>
      </div>
    </div>
  )
}
