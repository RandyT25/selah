import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
