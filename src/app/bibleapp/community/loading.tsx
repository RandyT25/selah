import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/loading/CardSkeleton";

export default function CommunityLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
