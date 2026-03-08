import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProvider(alias: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            updateIdentityProvider(adminClient, alias, provider),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.detail(alias)
            });
            queryClient.invalidateQueries({ queryKey: idpKeys.lists() });
        }
    });
}
