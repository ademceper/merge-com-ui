import { useQuery } from "@tanstack/react-query";
import { findClientById, findRoleById } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useRolesById(ids: string[]) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.roleDetails(ids),
        queryFn: async () => {
            if (ids.length > 0) {
                const roles = await Promise.all(
                    ids.map(id => findRoleById(adminClient, id))
                );
                return Promise.all(
                    roles.map(async role => ({
                        role: role!,
                        client: role!.clientRole
                            ? await findClientById(adminClient, role?.containerId!)
                            : undefined
                    }))
                );
            }
            return [];
        },
        enabled: ids.length > 0
    });
}
