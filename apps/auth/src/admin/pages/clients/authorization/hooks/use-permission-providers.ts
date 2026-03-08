import { useQuery } from "@tanstack/react-query";
import {
    listAllScopes,
    listPolicyProviders,
    listResources
} from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function usePermissionProviders(clientId: string) {
    return useQuery({
        queryKey: authzKeys.permissionProviders(clientId),
        queryFn: async () => {
            const params = { first: 0, max: 1 };
            const [policies, resources, scopes] = await Promise.all([
                listPolicyProviders(clientId),
                listResources(clientId, params),
                listAllScopes(clientId, params)
            ]);
            return {
                policies: policies.filter(
                    p => p.type === "resource" || p.type === "scope"
                ),
                resources: resources.length !== 1,
                scopes: scopes.length !== 1
            };
        }
    });
}
