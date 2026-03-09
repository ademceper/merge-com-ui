import { useQuery } from "@tanstack/react-query";
import {
    findClientById,
    findPermissionsByResource,
    getResource
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useResourceDetails(clientId: string, resourceId?: string) {
    return useQuery({
        queryKey: authzKeys.resourceDetails(clientId, resourceId),
        queryFn: () =>
            Promise.all([
                findClientById(clientId),
                resourceId
                    ? getResource(clientId, resourceId)
                    : Promise.resolve(undefined),
                resourceId
                    ? findPermissionsByResource(clientId, resourceId)
                    : Promise.resolve(undefined)
            ])
    });
}
