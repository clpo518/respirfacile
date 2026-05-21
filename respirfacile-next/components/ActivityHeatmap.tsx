'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DayData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  userId: string;
}

const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function getColor(count: number) {
  if (count === 0) return 'bg-beige-200';
  if (count === 1) return 'bg-forest-200';
  if (count === 2) return 'bg-forest-400';
  return 'bg-forest-600';
}

function buildGrid(data: DayData[]): { date: string; count: number }[][] {
  // Construire 12 semaines × 7 jours à partir d'aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countByDay: Record<string, number> = {};
  data.forEach((d) => { countByDay[d.date] = d.count; });

  // Aller 84 jours en arrière (12 semaines)
  const start = new Date(today);
  start.setDate(today.getDate() - 83);

  // Aligner sur le lundi
  const dayOfWeek = start.getDay(); // 0=dim
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + offset);

  const weeks: { date: string; count: number }[][] = [];
  let week: { date: string; count: number }[] = [];

  const d = new Date(start);
  while (d <= today || week.length > 0) {
    const dateStr = d.toISOString().slice(0, 10);
    const isFuture = d > today;
    week.push({ date: dateStr, count: isFuture ? -1 : (countByDay[dateStr] || 0) });

    if (d.getDay() === 0 || (d > today && week.length === 7)) {
      weeks.push(week);
      week = [];
      if (d > today) break;
    }
    d.setDate(d.getDate() + 1);
  }
  if (week.length > 0) weeks.push(week);

  return weeks;
}

export function ActivityHeatmap({ userId }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', ninetyDaysAgo.toISOString());

      if (!sessions) { setLoading(false); return; }

      const byDay: Record<string, number> = {};
      sessions.forEach((s) => {
        const day = s.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      });

      const points = Object.entries(byDay).map(([date, count]) => ({ date, count }));
      setData(points);
      setTotalSessions(sessions.length);
      setActiveDays(Object.keys(byDay).length);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-beige-200 p-6 animate-pulse">
        <div className="h-4 bg-beige-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-beige-100 rounded-xl" />
      </div>
    );
  }

  const weeks = buildGrid(data);

  // Trouver les mois à afficher
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (i === 0 || d.getDate() <= 7) {
        monthLabels.push({ label: MONTHS_FR[d.getMonth()], col: i });
      }
    }
  });

  return (
    <div className="bg-white rounded-3xl border border-beige-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-forest-800 text-sm">Activité, 12 dernières semaines</h3>
          <p className="text-xs text-forest-400 mt-0.5">
            {activeDays} jours actifs · {totalSessions} séances au total
          </p>
        </div>
        {/* Légende */}
        <div className="flex items-center gap-1.5 text-xs text-forest-400">
          <span>Moins</span>
          {[0, 1, 2, 3].map((lvl) => (
            <div
              key={lvl}
              className={`w-3 h-3 rounded-sm ${getColor(lvl)}`}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Labels mois */}
          <div className="flex mb-1 ml-7">
            {weeks.map((_, i) => {
              const label = monthLabels.find((m) => m.col === i);
              return (
                <div key={i} className="w-4 flex-shrink-0 text-center">
                  {label ? <span className="text-xs text-forest-400">{label.label}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Labels jours */}
            <div className="flex flex-col gap-1 mr-1">
              {DAYS_FR.map((d, i) => (
                <div key={i} className="h-3 w-5 text-xs text-forest-300 flex items-center justify-end pr-1">
                  {i % 2 === 0 ? d : ''}
                </div>
              ))}
            </div>

            {/* Cellules */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day.count > 0 ? `${day.date} : ${day.count} séance${day.count > 1 ? 's' : ''}` : day.date}
                    className={`w-3 h-3 rounded-sm transition-all cursor-default ${
                      day.count === -1
                        ? 'bg-transparent'
                        : getColor(day.count)
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
