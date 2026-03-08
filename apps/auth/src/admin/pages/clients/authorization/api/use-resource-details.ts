import { useQuery } from "@tanstack/react-query";
import {
    findClientById,
    findPermissionsByResource,
    getResource
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useResourceDetails(clientId: string, resourceId?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.resourceDetails(clientId, resourceId),
        queryFn: () =>
            Promise.all([
                findClientById(adminClient, clientId),
                resourceId
                    ? getResource(adminClient, clientId, resourceId)
                    : Promise.resolve(undefined),
                resourceId
                    ? findPermissionsByResource(adminClient, clientId, resourceId)
                    : Promise.resolve(undefined)
            ])
    });
}
