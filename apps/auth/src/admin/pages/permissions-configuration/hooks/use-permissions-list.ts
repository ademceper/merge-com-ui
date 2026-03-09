import { useQuery } from "@tanstack/react-query";
import { findPermissionsList } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function usePermissionsList(
    clientId: string,
    search: Record<string, unknown>,
    first: number,
    max: number
) {
    return useQuery({
        queryKey: permissionsKeys.list(clientId, search, first, max),
        queryFn: () => findPermissionsList(clientId, search, first, max),
        enabled: !!clientId
    });
}
