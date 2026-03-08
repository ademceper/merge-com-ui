import { useQuery } from "@tanstack/react-query";
import { findPermissionDetail } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function usePermissionDetail(clientId: string, permissionId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: permissionsKeys.detail(clientId, permissionId),
        queryFn: () => findPermissionDetail(adminClient, clientId, permissionId),
        enabled: !!clientId && !!permissionId
    });
}
