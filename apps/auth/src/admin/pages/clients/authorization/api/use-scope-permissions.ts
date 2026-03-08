import { useQuery } from "@tanstack/react-query";
import {
    listAllPermissionsByScope,
    listAllResourcesByScope
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useScopePermissions(clientId: string, scopeId: string, enabled: boolean) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: [...authzKeys.all, "scopePermissions", clientId, scopeId],
        queryFn: async () => {
            const [resources, permissions] = await Promise.all([
                listAllResourcesByScope(adminClient, clientId, scopeId),
                listAllPermissionsByScope(adminClient, clientId, scopeId)
            ]);
            return { resources, permissions };
        },
        enabled
    });
}
