import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { createIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useCreateIdentityProvider() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            createIdentityProvider(adminClient, provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.all });
        }
    });
}
