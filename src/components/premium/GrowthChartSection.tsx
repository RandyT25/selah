"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GrowthChart } from "@/components/premium/GrowthChart";

interface WeekData {
  weekStart: string;
  highlights: number;
  journal: number;
  prayers: number;
}

type Metric = "highlights" | "journal" | "prayers";

const TABS: { key: Metric; label: string; color: string }[] = [
  { key: "highlights", label: "Reading",    color: "#f59e0b" },
  { key: "journal",    label: "Journal",    color: "#8b5cf6" },
  { key: "prayers",    label: "Prayers",    color: "#10b981" },
];

export function GrowthChartSection({ weeks }: { weeks: WeekData[] }) {
  const [active, setActive] = useState<Metric>("highlights");

  if (weeks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Start reading, journaling, and praying to see your growth charts here.
        </CardContent>
      </Card>
    );
  }

  const current = TABS.find((t) => t.key === active)!;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Activity — Last 12 Weeks</CardTitle>
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={active === tab.key ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <GrowthChart weeks={weeks} metric={active} color={current.color} />
      </CardContent>
    </Card>
  );
}
