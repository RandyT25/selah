"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BibleAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bibleapp]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        An unexpected error occurred. Your data is safe — please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
