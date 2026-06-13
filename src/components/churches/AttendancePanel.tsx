"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getInitials } from "@/lib/utils/format";

interface AttendanceRecord {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  checked_in_at: string;
  check_in_method: string;
  profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  churchId: string;
  eventId: string;
}

export function AttendancePanel({ churchId, eventId }: Props) {
  const [records, setRecords]   = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [guestName, setGuestName] = useState("");
  const [adding, setAdding]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/attendance?event_id=${eventId}`);
      const data = await res.json();
      setRecords(data.attendance ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [churchId, eventId]);

  const addGuest = async () => {
    if (!guestName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, guest_name: guestName, check_in_method: "manual" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setGuestName("");
      await load();
      toast.success("Guest checked in");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to check in guest");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Attendance</span>
          <Badge variant="secondary">{records.length}</Badge>
        </div>
      </div>

      {/* Add guest */}
      <div className="flex gap-2">
        <Input
          placeholder="Guest name (manual check-in)..."
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGuest()}
          className="text-sm"
        />
        <Button size="sm" onClick={addGuest} disabled={adding || !guestName.trim()}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
          No check-ins yet
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {records.map((r) => {
            const name = r.profiles?.display_name ?? r.profiles?.full_name ?? r.guest_name ?? "Guest";
            return (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={r.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.check_in_method === "qr" ? "QR" : "Manual"} · {formatDistanceToNow(new Date(r.checked_in_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
