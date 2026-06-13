import { Skeleton } from "@/components/ui/skeleton";

export default function DevotionalsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
