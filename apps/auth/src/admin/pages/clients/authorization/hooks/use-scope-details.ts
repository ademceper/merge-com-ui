import { useQuery } from "@tanstack/react-query";
import { getAuthorizationScope } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useScopeDetails(clientId: string, scopeId?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.scopeDetails(clientId, scopeId),
        queryFn: async () => {
            if (!scopeId) return undefined;
            const scope = await getAuthorizationScope(adminClient, clientId, scopeId);
            if (!scope) throw new Error("notFound");
            return scope;
        }
    });
}
