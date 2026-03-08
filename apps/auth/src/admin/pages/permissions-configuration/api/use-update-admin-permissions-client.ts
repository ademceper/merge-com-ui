import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminPermissionsClient } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useUpdateAdminPermissionsClient() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            client,
            updates
        }: {
            client: ClientRepresentation;
            updates: ClientRepresentation;
        }) => updateAdminPermissionsClient(adminClient, client, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: permissionsKeys.adminPermissionsClient()
            });
        }
    });
}
