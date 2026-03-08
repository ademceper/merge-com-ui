import { useQuery } from "@tanstack/react-query";
import { findPoliciesList } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function usePoliciesList(clientId: string, filterType?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: permissionsKeys.policies(clientId, filterType),
        queryFn: () => findPoliciesList(adminClient, clientId, filterType),
        enabled: !!clientId
    });
}
