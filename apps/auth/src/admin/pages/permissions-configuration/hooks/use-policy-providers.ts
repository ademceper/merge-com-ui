import { useQuery } from "@tanstack/react-query";
import { findPolicyProviders } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function usePolicyProviders(clientId: string) {
    return useQuery({
        queryKey: [...permissionsKeys.providers(clientId), "providerNames"],
        queryFn: () => findPolicyProviders(clientId),
        enabled: !!clientId
    });
}
