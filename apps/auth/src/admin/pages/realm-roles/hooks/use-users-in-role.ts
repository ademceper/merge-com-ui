import { useQuery } from "@tanstack/react-query";
import {
    findRealmRole,
    findUsersWithClientRole,
    findUsersWithRealmRole
} from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useUsersInRole(id: string, clientId?: string) {
    return useQuery({
        queryKey: [...roleKeys.detail(id), "users"],
        queryFn: async () => {
            const role = await findRealmRole(id);
            if (!role) throw new Error("Role not found");
            if (role.clientRole && clientId) {
                return findUsersWithClientRole(clientId, role.name!);
            }
            return findUsersWithRealmRole(role.name!);
        }
    });
}
