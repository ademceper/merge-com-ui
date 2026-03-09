import { useQuery } from "@tanstack/react-query";
import {
    findPermissions,
    getAssociatedPolicies
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function usePermissions(
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    return useQuery({
        queryKey: authzKeys.permissions(clientId, first, max, search),
        queryFn: async () => {
            const permissions = await findPermissions(
                clientId,
                first,
                max + 1,
                search
            );

            return await Promise.all(
                permissions.map(async permission => {
                    const associatedPolicies = await getAssociatedPolicies(
                        clientId,
                        permission.id!
                    );

                    return {
                        ...permission,
                        associatedPolicies,
                        isExpanded: false
                    };
                })
            );
        }
    });
}
