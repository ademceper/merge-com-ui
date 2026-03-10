import { TableSkeleton } from "./table-skeleton";

export function WorkflowsSkeleton() {
    return (
        <TableSkeleton
            columns={4}
            columnWidths={["w-[30%]", "w-[30%]", "w-[25%]", "w-[15%]"]}
        />
    );
}
