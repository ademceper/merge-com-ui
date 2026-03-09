import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { TableSkeleton } from "./table-skeleton";

export function GroupsSkeleton() {
    return (
        <div className="flex h-full gap-4 pt-4 pb-6 px-0">
            <div className="w-64 space-y-2">
                <Skeleton className="h-9 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="flex-1">
                <TableSkeleton columns={3} hasToolbar={false} />
            </div>
        </div>
    );
}
