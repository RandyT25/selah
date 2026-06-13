"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

interface WeekData {
  weekStart: string;
  highlights: number;
  journal: number;
  prayers: number;
}

interface Props {
  weeks: WeekData[];
  metric: "highlights" | "journal" | "prayers";
  color?: string;
}

const METRIC_LABELS = {
  highlights: "Verses Read",
  journal:    "Journal Entries",
  prayers:    "Prayers",
};

const COLORS = {
  highlights: "#f59e0b",
  journal:    "#8b5cf6",
  prayers:    "#10b981",
};

export function GrowthChart({ weeks, metric, color }: Props) {
  const resolvedColor = color ?? COLORS[metric];

  const data = weeks.map((w) => ({
    week:  format(new Date(w.weekStart + "T12:00:00"), "MMM d"),
    value: w[metric],
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={resolvedColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={resolvedColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={24}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v: number) => [v, METRIC_LABELS[metric]]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={resolvedColor}
          strokeWidth={2}
          fill={`url(#grad-${metric})`}
          dot={{ r: 3, fill: resolvedColor }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
