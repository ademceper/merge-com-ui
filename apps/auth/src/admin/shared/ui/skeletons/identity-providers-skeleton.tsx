import { TableSkeleton } from "./table-skeleton";

export function IdentityProvidersSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0">
            <TableSkeleton columns={4} />
        </div>
    );
}
