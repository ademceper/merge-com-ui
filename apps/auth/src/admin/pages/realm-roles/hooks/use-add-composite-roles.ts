import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCompositeRoles } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useAddCompositeRoles() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            roleId,
            realm,
            composites
        }: {
            roleId: string;
            realm: string;
            composites: RoleRepresentation[];
        }) => addCompositeRoles(roleId, realm, composites),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }
    });
}
