"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  planId: string;
  userId: string;
  day: number;
  completedDays: number[];
}

export default function MarkCompleteButton({ planId, userId, day, completedDays }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markComplete = async () => {
    setLoading(true);
    const supabase = createClient();
    const newCompleted = Array.from(new Set(completedDays.concat(day)));
    const nextDay = day + 1;

    const { error } = await supabase
      .from("plan_progress")
      .update({
        completed_days: newCompleted,
        current_day: nextDay,
        completed_at: newCompleted.length >= (completedDays.length + 1) ? undefined : undefined,
        updated_at: new Date().toISOString(),
      } as Record<never, never>)
      .eq("plan_id", planId)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to mark day complete");
    } else {
      // Update streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, longest_streak, last_active_at")
        .eq("id", userId)
        .single();

      if (profile) {
        const now = new Date();
        const today = now.toDateString();
        const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;

        if (lastActive?.toDateString() !== today) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const newStreak =
            lastActive?.toDateString() === yesterday.toDateString()
              ? (profile.streak_count ?? 0) + 1
              : 1;

          await supabase
            .from("profiles")
            .update({
              streak_count: newStreak,
              longest_streak: Math.max(newStreak, profile.longest_streak ?? 0),
              last_active_at: now.toISOString(),
            })
            .eq("id", userId);
        }
      }

      toast.success(`Day ${day} complete! Well done.`);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={markComplete} disabled={loading} className="shrink-0">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Done
        </>
      )}
    </Button>
  );
}
