import { useQuery } from "@tanstack/react-query";
import { findProvidersAndPolicies } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useProvidersAndPolicies(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: permissionsKeys.providers(clientId),
        queryFn: () => findProvidersAndPolicies(adminClient, clientId),
        enabled: !!clientId
    });
}
