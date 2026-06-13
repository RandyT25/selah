"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  error?: Error | null;
  reset?: () => void;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ErrorCard({
  error,
  reset,
  title = "Something went wrong",
  description,
  compact = false,
}: Props) {
  const message = description ?? error?.message ?? "An unexpected error occurred. Please try again.";

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        {reset && (
          <button onClick={reset} className="ml-auto text-xs underline shrink-0">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {reset && (
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
      )}
    </div>
  );
}
