"use client";

import { useEffect } from "react";

// Fires once per session on dashboard load to update the day streak.
export function DailyCheckIn() {
  useEffect(() => {
    fetch("/api/daily-checkin", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
