import { useQuery } from "@tanstack/react-query";
import {
    findPermissions,
    getAssociatedPolicies
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function usePermissions(
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.permissions(clientId, first, max, search),
        queryFn: async () => {
            const permissions = await findPermissions(
                adminClient,
                clientId,
                first,
                max + 1,
                search
            );

            return await Promise.all(
                permissions.map(async permission => {
                    const associatedPolicies = await getAssociatedPolicies(
                        adminClient,
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
