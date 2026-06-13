"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalytics } from "@/hooks/useAnalytics";

export function WaitlistForm() {
  const { capture } = useAnalytics();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      capture("waitlist_submitted");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-base">You&apos;re on the list!</p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll email you the moment premium launches. Thank you for believing in Selah. 🙏
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-sm mx-auto">
      <Input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        autoComplete="name"
      />
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        autoComplete="email"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading || !email}>
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Joining...</>
          : <><Mail className="h-4 w-4 mr-2" />Notify me when it&apos;s ready</>
        }
      </Button>
    </form>
  );
}
