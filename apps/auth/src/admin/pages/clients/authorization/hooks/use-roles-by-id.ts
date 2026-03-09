import { useQuery } from "@tanstack/react-query";
import { findClientById, findRoleById } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useRolesById(ids: string[]) {
    return useQuery({
        queryKey: authzKeys.roleDetails(ids),
        queryFn: async () => {
            if (ids.length > 0) {
                const roles = await Promise.all(
                    ids.map(id => findRoleById(id))
                );
                return Promise.all(
                    roles.map(async role => ({
                        role: role!,
                        client: role!.clientRole
                            ? await findClientById(role?.containerId!)
                            : undefined
                    }))
                );
            }
            return [];
        },
        enabled: ids.length > 0
    });
}
