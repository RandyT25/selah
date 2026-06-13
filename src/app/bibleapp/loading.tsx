import { Skeleton } from "@/components/ui/skeleton";

export default function BibleAppLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-3 pt-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
