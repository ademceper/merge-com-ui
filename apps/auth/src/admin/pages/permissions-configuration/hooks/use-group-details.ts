import { useQuery } from "@tanstack/react-query";
import { findGroupDetails } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function useGroupDetails(ids: string[]) {
    const sortedIds = [...ids].sort();
    return useQuery({
        queryKey: permissionsKeys.groupDetails(sortedIds),
        queryFn: () => findGroupDetails(ids),
        enabled: ids.length > 0
    });
}
