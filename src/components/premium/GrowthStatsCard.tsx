"use client";

import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "amber" | "green" | "blue" | "rose";
}

const ACCENT_STYLES = {
  amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600",
  green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600",
  blue:  "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600",
  rose:  "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-600",
};

export function GrowthStatsCard({ icon: Icon, label, value, sub, accent = "amber" }: Props) {
  return (
    <div className={cn("rounded-xl border p-4 flex gap-3 items-start", ACCENT_STYLES[accent])}>
      <div className="w-9 h-9 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs font-semibold mt-0.5">{label}</p>
        {sub && <p className="text-[10px] opacity-70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
