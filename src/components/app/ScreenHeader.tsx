"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  right?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function ScreenHeader({
  title,
  showBack = false,
  backHref,
  right,
  transparent = false,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center h-[52px] px-2",
        !transparent && "bg-background/90 backdrop-blur-2xl border-b border-border/30",
        transparent && "bg-transparent",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Left — back button or spacer */}
      <div className="w-10 flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-full text-foreground active:bg-muted transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Center title */}
      <div className="flex-1 flex items-center justify-center">
        {title && (
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
      </div>

      {/* Right actions */}
      <div className="w-10 flex items-center justify-end">
        {right}
      </div>
    </header>
  );
}
