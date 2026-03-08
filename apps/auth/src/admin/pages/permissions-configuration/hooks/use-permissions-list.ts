import { useQuery } from "@tanstack/react-query";
import { findPermissionsList } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function usePermissionsList(
    clientId: string,
    search: Record<string, unknown>,
    first: number,
    max: number
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: permissionsKeys.list(clientId, search, first, max),
        queryFn: () => findPermissionsList(adminClient, clientId, search, first, max),
        enabled: !!clientId
    });
}
