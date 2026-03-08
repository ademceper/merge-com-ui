import { useQuery } from "@tanstack/react-query";
import {
    findPermissionsByResource,
    findScopesByResource
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useDetailCell(clientId: string, resourceId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.detailCell(clientId, resourceId),
        queryFn: () =>
            Promise.all([
                findScopesByResource(adminClient, clientId, resourceId),
                findPermissionsByResource(adminClient, clientId, resourceId)
            ])
    });
}
