"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EnrollButton({ planId, userId }: { planId: string; userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enroll = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("plan_progress").insert({
      user_id: userId,
      plan_id: planId,
      current_day: 1,
      completed_days: [],
      is_active: true,
    });

    if (error) {
      toast.error("Failed to enroll in plan");
    } else {
      toast.success("Enrolled! Your journey begins today.");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button variant="gold" onClick={enroll} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Start This Plan
    </Button>
  );
}
