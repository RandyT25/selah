import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
      className
    )}>
      <Sparkles className="h-2.5 w-2.5" />
      Premium
    </span>
  );
}
