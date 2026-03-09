import { TableSkeleton } from "./table-skeleton";

export function OrganizationsSkeleton() {
    return (
        <TableSkeleton
            columns={4}
            columnWidths={["w-[30%]", "w-[25%]", "w-[35%]", "w-[10%]"]}
        />
    );
}
