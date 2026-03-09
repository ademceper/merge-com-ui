import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { TableSkeleton } from "./table-skeleton";

interface TabsTableSkeletonProps {
    tabs?: number;
    columns?: number;
    rows?: number;
}

export function TabsTableSkeleton({
    tabs = 3,
    columns = 4,
    rows = 6
}: TabsTableSkeletonProps) {
    return (
        <div className="pt-4 pb-6 px-0 space-y-4">
            <div className="flex gap-2 border-b pb-2">
                {Array.from({ length: tabs }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-28" />
                ))}
            </div>
            <TableSkeleton columns={columns} rows={rows} />
        </div>
    );
}
