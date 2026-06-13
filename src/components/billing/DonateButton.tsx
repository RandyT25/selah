"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function DonateButton({ className, variant = "ghost" }: {
  className?: string;
  variant?: "ghost" | "outline";
}) {
  return (
    <Button variant={variant} asChild className={cn("gap-1.5 text-rose-600", className)}>
      <Link href="/bibleapp/donate">
        <Heart className="h-4 w-4" />
        Support Selah
      </Link>
    </Button>
  );
}
