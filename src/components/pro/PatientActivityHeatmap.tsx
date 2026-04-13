import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapPatient {
  id: string;
  full_name: string | null;
  sessions: { created_at: string }[];
}

interface PatientActivityHeatmapProps {
  patients: HeatmapPatient[];
  onPatientClick: (id: string) => void;
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS = 14;

const PatientActivityHeatmap = ({ patients, onPatientClick }: PatientActivityHeatmapProps) => {
  const dates = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      arr.push(d);
    }
    return arr;
  }, []);

  const grid = useMemo(() => {
    return patients.map((patient) => {
      const countByDay = new Map<string, number>();
      patient.sessions.forEach((s) => {
        const key = new Date(s.created_at).toISOString().slice(0, 10);
        countByDay.set(key, (countByDay.get(key) || 0) + 1);
      });

      const cells = dates.map((d) => {
        const key = d.toISOString().slice(0, 10);
        return countByDay.get(key) || 0;
      });

      return { patient, cells };
    });
  }, [patients, dates]);

  if (patients.length === 0) return null;

  const getCellColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-green-300 dark:bg-green-700";
    return "bg-green-500 dark:bg-green-500";
  };

  const truncateName = (name: string | null) => {
    const n = name || "Patient";
    return n.length > 10 ? n.slice(0, 10) + "…" : n;
  };

  const formatDateLabel = (d: Date) => {
    return `${DAY_LABELS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="overflow-x-auto -mx-1">
          <div className="inline-block min-w-full">
            {/* Date headers */}
            <div className="flex items-center mb-1">
              <div className="w-24 shrink-0" />
              <div className="flex gap-0.5">
                {dates.map((d, i) => {
                  const dayAbbr = DAY_LABELS[d.getDay()].charAt(0);
                  return (
                    <div
                      key={i}
                      className="w-6 h-4 text-[9px] text-muted-foreground text-center leading-4 shrink-0"
                      title={formatDateLabel(d)}
                    >
                      {dayAbbr}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient rows */}
            <TooltipProvider delayDuration={200}>
              {grid.map(({ patient, cells }) => (
                <div
                  key={patient.id}
                  className="flex items-center cursor-pointer hover:bg-accent/50 rounded-sm transition-colors"
                  onClick={() => onPatientClick(patient.id)}
                >
                  <div className="w-24 shrink-0 text-xs text-foreground truncate pr-2 py-0.5">
                    {truncateName(patient.full_name)}
                  </div>
                  <div className="flex gap-0.5">
                    {cells.map((count, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-6 h-5 rounded-[3px] shrink-0 ${getCellColor(count)} transition-colors`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{patient.full_name || "Patient"}</p>
                          <p>{formatDateLabel(dates[i])}</p>
                          <p>{count === 0 ? "Aucune séance" : `${count} séance${count > 1 ? "s" : ""}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </TooltipProvider>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded-[2px] bg-muted" />
                <span>Pas d'entraînement</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded-[2px] bg-green-400 dark:bg-green-600" />
                <span>Entraînement(s)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientActivityHeatmap;
