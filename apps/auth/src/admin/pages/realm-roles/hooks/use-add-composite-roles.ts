import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCompositeRoles } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useAddCompositeRoles() {
    const { adminClient } = useAdminClient();
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
        }) => addCompositeRoles(adminClient, roleId, realm, composites),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }
    });
}
