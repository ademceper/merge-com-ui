import { useQuery } from "@tanstack/react-query";
import { listResourcesAndScopes } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useResourcesAndScopes(clientId: string) {
    return useQuery({
        queryKey: authzKeys.resourcesAndScopes(clientId),
        queryFn: () => listResourcesAndScopes(clientId)
    });
}
