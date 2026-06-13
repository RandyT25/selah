import { Skeleton } from "@/components/ui/skeleton";

export default function AILoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-3xl mx-auto px-4 py-4 gap-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="flex-1 space-y-4 pt-2">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-20 flex-1 rounded-xl" />
        </div>
        <div className="flex gap-3 justify-end">
          <Skeleton className="h-14 w-2/3 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-28 flex-1 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
