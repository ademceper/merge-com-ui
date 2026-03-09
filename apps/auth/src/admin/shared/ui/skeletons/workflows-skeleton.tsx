import { TableSkeleton } from "./table-skeleton";

export function WorkflowsSkeleton() {
    return (
        <div className="bg-muted/30 p-0">
            <TableSkeleton columns={4} />
        </div>
    );
}
