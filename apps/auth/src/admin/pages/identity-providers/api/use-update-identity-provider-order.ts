import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateIdentityProviderOrder } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProviderOrder() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (
            providers: { alias: string; provider: IdentityProviderRepresentation }[]
        ) => updateIdentityProviderOrder(adminClient, providers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.lists() });
        }
    });
}
