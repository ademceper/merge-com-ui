import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRealmRole } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useUpdateRealmRole(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (role: RoleRepresentation) =>
            updateRealmRole(adminClient, id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roleKeys.detail(id)
            });
            queryClient.invalidateQueries({
                queryKey: roleKeys.lists()
            });
        }
    });
}
