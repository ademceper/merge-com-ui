import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    addClientScopeMappings,
    addRealmScopeMappings
} from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useAssignScopeRoles(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (
            rows: { client?: { id: string }; role: RoleMappingPayload }[]
        ) => {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            await addRealmScopeMappings(id, realmRoles);
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        addClientScopeMappings(
                            id,
                            row.client!.id!,
                            [row.role as RoleMappingPayload]
                        )
                    )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });
}
