"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import Link from "next/link";

// Synthetic data to show what the chart looks like — motivates upgrade
const DEMO_WEEKS = [
  { week: "Apr 7",  v: 2 },
  { week: "Apr 14", v: 4 },
  { week: "Apr 21", v: 3 },
  { week: "Apr 28", v: 6 },
  { week: "May 5",  v: 5 },
  { week: "May 12", v: 8 },
  { week: "May 19", v: 7 },
  { week: "May 26", v: 10 },
  { week: "Jun 2",  v: 9 },
  { week: "Jun 9",  v: 12 },
  { week: "Jun 16", v: 11 },
  { week: "Jun 23", v: 14 },
];

export function GrowthTeaserSection() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity — Last 12 Weeks</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 relative">
        {/* Blurred chart preview */}
        <div className="blur-[3px] pointer-events-none select-none opacity-70">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={DEMO_WEEKS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="teaser-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#teaser-grad)"
                dot={{ r: 3, fill: "#f59e0b" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-[1px]">
          <Lock className="h-5 w-5 text-amber-500" />
          <p className="text-sm font-semibold">See your real growth data</p>
          <Button size="sm" variant="gold" asChild>
            <Link href="/bibleapp/upgrade">Unlock Growth Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
