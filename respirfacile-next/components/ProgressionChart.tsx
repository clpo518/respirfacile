'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DataPoint {
  date: string;
  score: number;
  label: string;
}

interface ProgressionChartProps {
  userId: string;
  exerciseId?: string; // si null, moyenne tous exercices
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-forest-800 text-white px-3 py-2 rounded-xl text-sm shadow-lg">
        <p className="font-semibold">{payload[0].value} pas</p>
        <p className="text-forest-300 text-xs">{label}</p>
      </div>
    );
  }
  return null;
};

export function ProgressionChart({ userId, exerciseId, title = "Progression" }: ProgressionChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let query = supabase
        .from('sessions')
        .select('created_at, score, exercise_id')
        .eq('user_id', userId)
        .not('score', 'is', null)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (exerciseId) {
        query = query.eq('exercise_id', exerciseId);
      }

      const { data: sessions } = await query;

      if (!sessions?.length) {
        setLoading(false);
        return;
      }

      // Grouper par jour, garder le meilleur score de la journée
      const byDay: Record<string, number> = {};
      sessions.forEach((s) => {
        const day = s.created_at.slice(0, 10);
        if (!byDay[day] || (s.score && s.score > byDay[day])) {
          byDay[day] = s.score!;
        }
      });

      const points: DataPoint[] = Object.entries(byDay).map(([date, score]) => {
        const d = new Date(date);
        const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        return { date, score, label };
      });

      setData(points);

      const best = Math.max(...points.map(p => p.score));
      setBestScore(best);

      // Calcul tendance : comparaison première moitié vs deuxième moitié
      if (points.length >= 4) {
        const half = Math.floor(points.length / 2);
        const firstHalfAvg = points.slice(0, half).reduce((s, p) => s + p.score, 0) / half;
        const secondHalfAvg = points.slice(half).reduce((s, p) => s + p.score, 0) / (points.length - half);
        if (secondHalfAvg > firstHalfAvg * 1.05) setTrend('up');
        else if (secondHalfAvg < firstHalfAvg * 0.95) setTrend('down');
        else setTrend('stable');
      }

      setLoading(false);
    };
    load();
  }, [userId, exerciseId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-beige-200 p-6 animate-pulse">
        <div className="h-4 bg-beige-200 rounded w-1/3 mb-4" />
        <div className="h-32 bg-beige-100 rounded-xl" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-3xl border border-beige-200 p-6 text-center">
        <p className="text-4xl mb-2">📈</p>
        <p className="text-forest-700 font-medium text-sm">Votre courbe de progression apparaîtra ici</p>
        <p className="text-forest-400 text-xs mt-1">Après votre première séance avec un score</p>
      </div>
    );
  }

  const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  const trendLabel = trend === 'up' ? 'En progression' : trend === 'down' ? 'En baisse' : 'Stable';
  const trendColor = trend === 'up' ? 'text-green-700 bg-green-50 border-green-200' : trend === 'down' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200';
  const lastScore = data[data.length - 1]?.score;

  return (
    <div className="bg-white rounded-3xl border border-beige-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-forest-800 text-sm mb-0.5">{title}</h3>
          <p className="text-xs text-forest-400">30 derniers jours</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${trendColor}`}>
            {trendEmoji} {trendLabel}
          </span>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="flex gap-4 mb-5">
        <div className="text-center">
          <p className="text-xl font-bold text-forest-800">{lastScore}</p>
          <p className="text-xs text-forest-400">Score actuel</p>
        </div>
        <div className="w-px bg-beige-200" />
        <div className="text-center">
          <p className="text-xl font-bold text-copper-600">{bestScore}</p>
          <p className="text-xs text-forest-400">Record</p>
        </div>
        <div className="w-px bg-beige-200" />
        <div className="text-center">
          <p className="text-xl font-bold text-forest-800">{data.length}</p>
          <p className="text-xs text-forest-400">Séances</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5016" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2D5016" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#8a9a7a' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#8a9a7a' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#2D5016"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ fill: '#2D5016', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#8B4513', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
