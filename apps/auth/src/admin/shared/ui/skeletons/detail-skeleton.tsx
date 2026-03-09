import { Skeleton } from "@merge-rd/ui/components/skeleton";

interface DetailSkeletonProps {
    tabs?: number;
    fields?: number;
}

export function DetailSkeleton({ tabs = 4, fields = 6 }: DetailSkeletonProps) {
    return (
        <div className="pt-4 pb-6 px-0 space-y-6">
            <div className="flex gap-2 border-b pb-2">
                {Array.from({ length: tabs }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24" />
                ))}
            </div>
            <div className="space-y-4 max-w-2xl">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
            </div>
        </div>
    );
}
