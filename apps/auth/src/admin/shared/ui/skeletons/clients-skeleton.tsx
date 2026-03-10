import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { TableSkeleton } from "./table-skeleton";

export function ClientsSkeleton() {
    return (
        <>
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-32" />
            </div>
            <TableSkeleton
                columns={5}
                columnWidths={["w-[25%]", "w-[20%]", "w-[15%]", "w-[30%]", "w-[10%]"]}
            />
        </>
    );
}
