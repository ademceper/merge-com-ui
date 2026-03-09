import { useQuery } from "@tanstack/react-query";
import {
    listAllPermissionsByScope,
    listAllResourcesByScope
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useScopePermissions(clientId: string, scopeId: string, enabled: boolean) {
    return useQuery({
        queryKey: [...authzKeys.all, "scopePermissions", clientId, scopeId],
        queryFn: async () => {
            const [resources, permissions] = await Promise.all([
                listAllResourcesByScope(clientId, scopeId),
                listAllPermissionsByScope(clientId, scopeId)
            ]);
            return { resources, permissions };
        },
        enabled
    });
}
