import { TableSkeleton } from "./table-skeleton";

export function ClientScopesSkeleton() {
    return (
        <TableSkeleton
            columns={6}
            columnWidths={["w-[25%]", "w-[15%]", "w-[15%]", "w-[10%]", "w-[25%]", "w-[10%]"]}
        />
    );
}
