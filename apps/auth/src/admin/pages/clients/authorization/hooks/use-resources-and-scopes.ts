import { useQuery } from "@tanstack/react-query";
import { listResourcesAndScopes } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useResourcesAndScopes(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.resourcesAndScopes(clientId),
        queryFn: () => listResourcesAndScopes(adminClient, clientId)
    });
}
