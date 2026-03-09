import { Skeleton } from "@merge-rd/ui/components/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3 rounded-lg border p-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
