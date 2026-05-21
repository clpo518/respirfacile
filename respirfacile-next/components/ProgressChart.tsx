"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WeekData {
  week: string; // "S1", "S2", "S3", "S4"
  sessions: number;
  target: number; // 5 par défaut
}

interface ProgressChartProps {
  data: WeekData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Déterminer la couleur de chaque barre selon les critères
  const getBarColor = (sessions: number, target: number): string => {
    if (sessions >= target) {
      return "#2d5016"; // forest-700
    } else if (sessions > 0) {
      return "#b45f1a"; // copper-700
    } else {
      return "#d4d4d1"; // beige-400
    }
  };

  const colors = data.map((d) => getBarColor(d.sessions, d.target));

  // Tooltip personnalisé en français
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const word = dataPoint.sessions > 1 ? "séances" : "séance";
      return (
        <div className="bg-white rounded-lg border border-beige-300 px-3 py-2 shadow-md">
          <p className="text-sm font-medium text-forest-800">
            {dataPoint.sessions} {word} cette semaine
          </p>
          <p className="text-xs text-forest-500">
            Objectif: {dataPoint.target}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
          className="bg-transparent"
        >
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#5b7858" }}
            axisLine={{ stroke: "#e5dcd4" }}
            tickLine={{ stroke: "#e5dcd4" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#5b7858" }}
            axisLine={{ stroke: "#e5dcd4" }}
            tickLine={{ stroke: "#e5dcd4" }}
            domain={[0, "dataMax + 1"]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(45, 80, 22, 0.05)" }} />
          <Bar dataKey="sessions" fill="#2d5016" isAnimationActive={true} radius={[8, 8, 0, 0]}>
            {colors.map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
