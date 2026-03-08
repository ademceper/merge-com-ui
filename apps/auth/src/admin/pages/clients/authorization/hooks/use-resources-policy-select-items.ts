import type { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { useQuery } from "@tanstack/react-query";
import {
    fetchAssociatedItems,
    getResource,
    listPolicyProviders,
    searchResourcesOrPolicies
} from "../../../../api/client-authorization";
import { type Type, authzKeys, typeMapping } from "./keys";

export function useResourcesPolicySelectItems(
    clientId: string,
    name: Type,
    search: string,
    permissionId?: string,
    preSelected?: string
) {
    const functions = typeMapping[name];
    return useQuery({
        queryKey: authzKeys.resourcesPolicySelect(
            clientId,
            name,
            search,
            permissionId,
            preSelected
        ),
        queryFn: async () => {
            const params: PolicyQuery = Object.assign(
                { id: clientId, first: 0, max: 10, permission: "false" },
                search === "" ? null : { name: search }
            );
            return await Promise.all([
                listPolicyProviders(clientId),
                searchResourcesOrPolicies(
                    clientId,
                    functions.searchFunction,
                    params
                ),
                permissionId
                    ? fetchAssociatedItems(
                          clientId,
                          functions.fetchFunction,
                          permissionId
                      )
                    : Promise.resolve([]),
                preSelected && name === "resources"
                    ? getResource(clientId, preSelected)
                    : Promise.resolve([])
            ]);
        }
    });
}
