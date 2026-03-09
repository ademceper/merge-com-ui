import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCompositeRoles } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useRemoveCompositeRoles() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            parentRoleId,
            roles
        }: {
            parentRoleId: string;
            roles: RoleRepresentation[];
        }) => removeCompositeRoles(parentRoleId, roles),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roleKeys.lists()
            });
        }
    });
}
