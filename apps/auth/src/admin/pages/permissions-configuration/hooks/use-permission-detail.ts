import { useQuery } from "@tanstack/react-query";
import { findPermissionDetail } from "../../../api/permissions";
import { permissionsKeys } from "./keys";

export function usePermissionDetail(clientId: string, permissionId: string) {
    return useQuery({
        queryKey: permissionsKeys.detail(clientId, permissionId),
        queryFn: () => findPermissionDetail(clientId, permissionId),
        enabled: !!clientId && !!permissionId
    });
}
