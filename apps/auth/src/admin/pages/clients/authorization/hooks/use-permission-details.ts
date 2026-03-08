import { useQuery } from "@tanstack/react-query";
import {
    findOnePermission,
    getAssociatedPolicies,
    getAssociatedResources,
    getAssociatedScopes
} from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function usePermissionDetails(
    clientId: string,
    permissionType: string,
    permissionId?: string
) {
    return useQuery({
        queryKey: authzKeys.permissionDetails(clientId, permissionType, permissionId),
        queryFn: async () => {
            if (!permissionId) {
                return {};
            }
            const [permission, resources, policies, scopes] = await Promise.all([
                findOnePermission(clientId, permissionType, permissionId),
                getAssociatedResources(clientId, permissionId),
                getAssociatedPolicies(clientId, permissionId),
                getAssociatedScopes(clientId, permissionId)
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
