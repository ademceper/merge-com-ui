import { useQuery } from "@tanstack/react-query";
import { findPoliciesList } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function usePoliciesList(clientId: string, filterType?: string) {
    return useQuery({
        queryKey: permissionsKeys.policies(clientId, filterType),
        queryFn: () => findPoliciesList(clientId, filterType),
        enabled: !!clientId
    });
}
