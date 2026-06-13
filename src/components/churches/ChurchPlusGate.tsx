"use client";

import { useState } from "react";
import { Sparkles, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePaymentProvider } from "@/hooks/usePaymentProvider";
import Link from "next/link";

interface Props {
  churchId: string;
  featureName: string;
  children: React.ReactNode;
}

export function ChurchPlusGate({ churchId, featureName, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [paymentsUnavailable, setPaymentsUnavailable] = useState(false);
  const router = useRouter();
  const { churchPlus, pricing } = usePaymentProvider();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const url = await churchPlus(churchId);
      router.push(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("not yet available") || msg.includes("503")) {
        setPaymentsUnavailable(true);
      } else {
        toast.error(msg || "Failed to start checkout");
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
        <div className="text-center space-y-3 p-6 max-w-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            {paymentsUnavailable ? (
              <Bell className="h-5 w-5 text-amber-600" />
            ) : (
              <Lock className="h-5 w-5 text-amber-600" />
            )}
          </div>

          {paymentsUnavailable ? (
            <>
              <p className="font-semibold text-sm">Church Plus is coming soon</p>
              <p className="text-xs text-muted-foreground">
                Join the waitlist and we&apos;ll notify you the moment it launches.
              </p>
              <Button variant="gold" size="sm" asChild>
                <Link href="/bibleapp/upgrade">Join the waitlist</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="font-semibold text-sm">{featureName} requires Church Plus</p>
              <p className="text-xs text-muted-foreground">
                Upgrade your church to unlock attendance tracking, ministry teams, analytics, and more.
              </p>
              <Button variant="gold" size="sm" onClick={handleUpgrade} disabled={loading} className="gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {pricing.provider === "xendit"
                  ? "Upgrade ke Church Plus — Rp 149.000/bln"
                  : "Upgrade to Church Plus — $9.99/mo"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
