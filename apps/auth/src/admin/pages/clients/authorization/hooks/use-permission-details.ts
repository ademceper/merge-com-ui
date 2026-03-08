import { useQuery } from "@tanstack/react-query";
import {
    findOnePermission,
    getAssociatedPolicies,
    getAssociatedResources,
    getAssociatedScopes
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function usePermissionDetails(
    clientId: string,
    permissionType: string,
    permissionId?: string
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.permissionDetails(clientId, permissionType, permissionId),
        queryFn: async () => {
            if (!permissionId) {
                return {};
            }
            const [permission, resources, policies, scopes] = await Promise.all([
                findOnePermission(adminClient, clientId, permissionType, permissionId),
                getAssociatedResources(adminClient, clientId, permissionId),
                getAssociatedPolicies(adminClient, clientId, permissionId),
                getAssociatedScopes(adminClient, clientId, permissionId)
            ]);

            if (!permission) {
                throw new Error("notFound");
            }

            return {
                permission,
                resources: resources.map(r => r._id),
                policies: policies.map(p => p.id!),
                scopes: scopes.map(s => s.id!)
            };
        }
    });
}
