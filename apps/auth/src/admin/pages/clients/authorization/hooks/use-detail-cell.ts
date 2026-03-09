import { useQuery } from "@tanstack/react-query";
import {
    findPermissionsByResource,
    findScopesByResource
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useDetailCell(clientId: string, resourceId: string) {
    return useQuery({
        queryKey: authzKeys.detailCell(clientId, resourceId),
        queryFn: () =>
            Promise.all([
                findScopesByResource(clientId, resourceId),
                findPermissionsByResource(clientId, resourceId)
            ])
    });
}
