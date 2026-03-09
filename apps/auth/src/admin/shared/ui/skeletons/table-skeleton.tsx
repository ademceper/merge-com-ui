import { Skeleton } from "@merge-rd/ui/components/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";

interface TableSkeletonProps {
    columns: number;
    rows?: number;
    hasToolbar?: boolean;
    toolbarAction?: boolean;
    columnWidths?: string[];
}

export function TableSkeleton({
    columns,
    rows = 6,
    hasToolbar = true,
    toolbarAction = true,
    columnWidths
}: TableSkeletonProps) {
    return (
        <div className="flex h-full w-full flex-col">
            {hasToolbar && (
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <Skeleton className="h-9 w-64" />
                    {toolbarAction && <Skeleton className="h-9 w-32" />}
                </div>
            )}
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead
                                key={i}
                                className={columnWidths?.[i]}
                            >
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <TableRow key={rowIdx}>
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <TableCell key={colIdx}>
                                    <Skeleton
                                        className={`h-4 ${colIdx === 0 ? "w-3/4" : "w-1/2"}`}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
