import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    findScopesByResource,
    listAllScopes
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useScopeSelectScopes(
    clientId: string,
    resourceId?: string,
    search?: string
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.scopeSelect(clientId, resourceId, search),
        queryFn: async (): Promise<ScopeRepresentation[]> => {
            if (!resourceId) {
                return listAllScopes(
                    adminClient,
                    clientId,
                    Object.assign(
                        { deep: false },
                        search === "" ? null : { name: search }
                    )
                );
            }
            return findScopesByResource(adminClient, clientId, resourceId);
        }
    });
}
