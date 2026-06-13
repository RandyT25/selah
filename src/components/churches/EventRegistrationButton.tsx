"use client";

import { useState } from "react";
import { CalendarCheck, CalendarX, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface Props {
  churchId:    string;
  eventId:     string;
  isRegistered: boolean;
  isWaitlisted: boolean;
  capacity?:   number | null;
  registered?: number;
  registrationRequired: boolean;
  onUpdate?: (status: "registered" | "waitlisted" | null) => void;
}

export function EventRegistrationButton({
  churchId, eventId, isRegistered, isWaitlisted,
  capacity, registered = 0, registrationRequired, onUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!registrationRequired) return null;

  const isFull = capacity ? registered >= capacity : false;
  const spotsLeft = capacity ? Math.max(0, capacity - registered) : null;

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/events/${eventId}/register`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.status === "waitlisted" ? "Added to waitlist" : "You're registered!");
      onUpdate?.(data.status);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/events/${eventId}/register`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Registration canceled");
      onUpdate?.(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 text-green-600 border-green-300" onClick={handleCancel} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarCheck className="h-3.5 w-3.5" />}
        Registered {spotsLeft !== null && <span className="text-xs text-muted-foreground">· {spotsLeft} spots left</span>}
      </Button>
    );
  }

  if (isWaitlisted) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 text-amber-600 border-amber-300" onClick={handleCancel} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
        Waitlisted
      </Button>
    );
  }

  return (
    <Button
      variant={isFull ? "outline" : "default"}
      size="sm"
      className={cn("gap-1.5", isFull && "text-muted-foreground")}
      onClick={isFull ? handleRegister : handleRegister}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarCheck className="h-3.5 w-3.5" />}
      {isFull ? "Join Waitlist" : `RSVP${spotsLeft !== null ? ` · ${spotsLeft} spots` : ""}`}
    </Button>
  );
}
