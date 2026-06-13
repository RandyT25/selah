"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type State = "loading" | "prompt_guest" | "success" | "already" | "error";

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<State>(token ? "loading" : "error");
  const [message, setMessage] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doCheckin = async (name?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guest_name: name }),
      });
      const data = await res.json();
      if (res.status === 200) {
        if (data.success) {
          setState("success"); setEventTitle(data.event ?? "");
        } else {
          setState("already"); setEventTitle(data.event ?? "");
        }
      } else if (res.status === 400 && data.error?.includes("guest")) {
        setState("prompt_guest");
      } else {
        setState("error"); setMessage(data.error ?? "Check-in failed");
      }
    } catch {
      setState("error"); setMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) doCheckin();
    else { setState("error"); setMessage("Missing check-in token."); }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6">
        <Image src="/logo-mark.png" alt="Selah" width={48} height={48} className="mx-auto" />
      </div>

      {state === "loading" && (
        <div className="space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Checking you in…</p>
        </div>
      )}

      {state === "success" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Checked in! 🙏</h1>
          {eventTitle && <p className="text-muted-foreground">{eventTitle}</p>}
          <p className="text-sm text-muted-foreground">God bless you today.</p>
          <Button onClick={() => router.push("/bibleapp/dashboard")} className="mt-2">
            Open Selah
          </Button>
        </div>
      )}

      {state === "already" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">Already checked in</h1>
          {eventTitle && <p className="text-muted-foreground">{eventTitle}</p>}
          <Button variant="outline" onClick={() => router.push("/bibleapp/dashboard")}>
            Go to App
          </Button>
        </div>
      )}

      {state === "prompt_guest" && (
        <div className="space-y-4 w-full max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold">Enter your name to check in</h1>
          <Input
            placeholder="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doCheckin(guestName)}
          />
          <Button
            className="w-full"
            onClick={() => doCheckin(guestName)}
            disabled={submitting || !guestName.trim()}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check In as Guest"}
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold">Check-in failed</h1>
          <p className="text-muted-foreground text-sm">{message || "Invalid or expired token."}</p>
          <Button variant="outline" onClick={() => router.push("/bibleapp/dashboard")}>
            Go to App
          </Button>
        </div>
      )}
    </div>
  );
}
