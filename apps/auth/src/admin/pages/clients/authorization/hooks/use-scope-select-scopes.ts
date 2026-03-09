import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    findScopesByResource,
    listAllScopes
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useScopeSelectScopes(
    clientId: string,
    resourceId?: string,
    search?: string
) {
    return useQuery({
        queryKey: authzKeys.scopeSelect(clientId, resourceId, search),
        queryFn: async (): Promise<ScopeRepresentation[]> => {
            if (!resourceId) {
                return listAllScopes(
                    clientId,
                    Object.assign(
                        { deep: false },
                        search === "" ? null : { name: search }
                    )
                );
            }
            return findScopesByResource(clientId, resourceId);
        }
    });
}
