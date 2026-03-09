import { TableSkeleton } from "./table-skeleton";

export function UsersSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0">
            <TableSkeleton columns={4} />
        </div>
    );
}
