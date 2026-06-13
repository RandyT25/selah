import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border p-4 flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
