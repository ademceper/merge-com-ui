import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientRole } from "../../../api/realm-roles";
import { roleKeys } from "./keys";

export function useUpdateClientRole(clientId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            roleName,
            role
        }: {
            roleName: string;
            role: RoleRepresentation;
        }) => updateClientRole(clientId, roleName, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }
    });
}
