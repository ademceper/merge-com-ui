import { TableSkeleton } from "./table-skeleton";

export function PageSectionSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0">
            <TableSkeleton columns={3} />
        </div>
    );
}
