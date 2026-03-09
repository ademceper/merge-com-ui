import { useQuery } from "@tanstack/react-query";
import { findRoleDetails } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function useRoleDetails(ids: string[]) {
    const sortedIds = [...ids].sort();
    return useQuery({
        queryKey: permissionsKeys.roleDetails(sortedIds),
        queryFn: () => findRoleDetails(ids),
        enabled: ids.length > 0
    });
}
