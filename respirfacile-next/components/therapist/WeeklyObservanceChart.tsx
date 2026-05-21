"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyData {
  week: string;
  sessions: number;
  start: string;
  end: string;
}

interface WeeklyObservanceChartProps {
  data: WeeklyData[];
}

export function WeeklyObservanceChart({ data }: WeeklyObservanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 93, 67, 0.1)" />
        <XAxis
          dataKey="week"
          stroke="#4a5d43"
          style={{ fontSize: "12px", fill: "#4a5d43" }}
        />
        <YAxis
          stroke="#4a5d43"
          style={{ fontSize: "12px", fill: "#4a5d43" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fbf8f2",
            border: "1px solid #f0e9dc",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(74, 93, 67, 0.08)",
          }}
          labelStyle={{ color: "#2d3d28" }}
          formatter={(value: any) => [`${value} séances`, "Séances"]}
          labelFormatter={(label: any) => {
            const item = data.find(d => d.week === String(label));
            return item ? `${item.start} - ${item.end}` : String(label);
          }}
          cursor={{ fill: "rgba(74, 93, 67, 0.08)" }}
        />
        <Bar
          dataKey="sessions"
          fill="#4a5d43"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
