import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRealmRoleMappings, addClientRoleMappings } from "../../../api/groups";
import { groupKeys } from "./keys";

type RowInput = {
    role: { id?: string; name?: string };
    client?: { id?: string };
};

/**
 * Assign realm and client roles to a group.
 */
export function useAssignGroupRoles(groupId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rows: RowInput[]) => {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            await addRealmRoleMappings(groupId, realmRoles);
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        addClientRoleMappings(groupId, row.client!.id!, [
                            row.role as RoleMappingPayload
                        ])
                    )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
