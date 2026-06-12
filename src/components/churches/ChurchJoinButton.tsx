"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, LogOut } from "lucide-react";

interface Props {
  churchId: string;
  userId: string;
  isMember: boolean;
  isAdmin: boolean;
}

export function ChurchJoinButton({ churchId, userId, isMember, isAdmin }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const join = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("church_members")
      .insert({ church_id: churchId, user_id: userId, role: "member" });
    setLoading(false);
    if (error) { toast.error("Failed to join church"); return; }
    toast.success("You joined this church! 🙏");
    router.refresh();
  };

  const leave = async () => {
    if (isAdmin) { toast.error("Admins cannot leave. Transfer admin first."); return; }
    setLoading(true);
    const { error } = await supabase
      .from("church_members")
      .delete()
      .eq("church_id", churchId)
      .eq("user_id", userId);
    setLoading(false);
    if (error) { toast.error("Failed to leave church"); return; }
    toast.success("You left this church");
    router.refresh();
  };

  if (isMember) {
    return (
      <Button variant="outline" size="sm" onClick={leave} loading={loading} disabled={isAdmin}>
        <LogOut className="h-4 w-4 mr-1" />
        {isAdmin ? "Admin" : "Leave"}
      </Button>
    );
  }

  return (
    <Button variant="gold" size="sm" onClick={join} loading={loading}>
      <Users className="h-4 w-4 mr-1" />
      Join Church
    </Button>
  );
}
