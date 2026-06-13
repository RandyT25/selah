import { Skeleton } from "@/components/ui/skeleton";

export default function GrowthLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
