import { Skeleton } from "@/components/ui/skeleton";

export default function AudioLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
