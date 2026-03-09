import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRealmRole, findRealmRoleByName } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useCreateRealmRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (role: RoleRepresentation) => {
            await createRealmRole(role);
            const created = await findRealmRoleByName(role.name!);
            if (!created) {
                throw new Error("Role not found after creation");
            }
            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roleKeys.lists()
            });
        }
    });
}
