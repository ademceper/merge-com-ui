import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePermission } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useSavePermission(clientId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            permissionId,
            permission
        }: {
            permissionId?: string;
            permission: PolicyRepresentation;
        }) => savePermission(adminClient, clientId, permission, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: permissionsKeys.all
            });
        }
    });
}
