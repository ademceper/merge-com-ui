import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { TableSkeleton } from "./table-skeleton";

export function ClientsSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0 min-w-0">
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-32" />
            </div>
            <TableSkeleton columns={5} />
        </div>
    );
}
