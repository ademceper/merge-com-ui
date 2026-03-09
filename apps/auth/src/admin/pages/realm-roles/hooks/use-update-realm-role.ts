import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRealmRole } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useUpdateRealmRole(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (role: RoleRepresentation) =>
            updateRealmRole(id, role),
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
