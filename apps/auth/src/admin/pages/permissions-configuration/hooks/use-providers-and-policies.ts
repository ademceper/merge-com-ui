import { useQuery } from "@tanstack/react-query";
import { findProvidersAndPolicies } from "../../../api/permissions";
import { permissionsKeys } from "./keys";

export function useProvidersAndPolicies(clientId: string) {
    return useQuery({
        queryKey: permissionsKeys.providers(clientId),
        queryFn: () => findProvidersAndPolicies(clientId),
        enabled: !!clientId
    });
}
