import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./CardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-pulse">
      {/* Greeting + streak */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-16 w-24 rounded-2xl" />
      </div>

      {/* Verse of Day */}
      <div className="rounded-2xl border p-6 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-36" />
          <CardSkeleton />
          <CardSkeleton />
          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
