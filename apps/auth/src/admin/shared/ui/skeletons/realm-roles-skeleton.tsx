import { TableSkeleton } from "./table-skeleton";

export function RealmRolesSkeleton() {
    return (
        <TableSkeleton
            columns={4}
            columnWidths={["w-[30%]", "w-[15%]", "w-[45%]", "w-[10%]"]}
        />
    );
}
