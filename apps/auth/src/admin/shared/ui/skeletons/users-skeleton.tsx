import { TableSkeleton } from "./table-skeleton";

export function UsersSkeleton() {
    return (
        <TableSkeleton
            columns={5}
            columnWidths={["w-[25%]", "w-[25%]", "w-[20%]", "w-[20%]", "w-[10%]"]}
        />
    );
}
