"use client";

import { useState } from "react";
import { QrCode, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  churchId: string;
  eventId:  string;
  eventTitle: string;
}

export function QRCheckInDisplay({ churchId, eventId, eventTitle }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [checkinUrl, setCheckinUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt]   = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/checkin-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckinUrl(data.checkinUrl);
      setExpiresAt(data.expiresAt);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    if (!checkinUrl) await generate();
  };

  const copyLink = async () => {
    if (!checkinUrl) return;
    await navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR code via Google Charts API (no npm dependency)
  const qrSrc = checkinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkinUrl)}`
    : null;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleOpen}>
        <QrCode className="h-4 w-4" />
        QR Check-in
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-base">Check-in for {eventTitle}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : qrSrc ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="Check-in QR code" className="rounded-xl border p-2" width={220} height={220} />
              </div>
              <p className="text-xs text-muted-foreground">
                Members scan this to record attendance. Expires in 2 hours.
              </p>
              {expiresAt && (
                <p className="text-[10px] text-muted-foreground">
                  Expires: {new Date(expiresAt).toLocaleTimeString()}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={copyLink}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
