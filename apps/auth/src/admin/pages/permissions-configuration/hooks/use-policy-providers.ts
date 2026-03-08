import { useQuery } from "@tanstack/react-query";
import { findPolicyProviders } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function usePolicyProviders(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: [...permissionsKeys.providers(clientId), "providerNames"],
        queryFn: () => findPolicyProviders(adminClient, clientId),
        enabled: !!clientId
    });
}
