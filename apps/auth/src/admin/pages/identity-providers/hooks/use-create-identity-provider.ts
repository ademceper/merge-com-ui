import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useCreateIdentityProvider() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            createIdentityProvider(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.all });
        }
    });
}
