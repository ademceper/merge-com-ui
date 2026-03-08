import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProvider(alias: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            updateIdentityProvider(alias, provider),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.detail(alias)
            });
            queryClient.invalidateQueries({ queryKey: idpKeys.lists() });
        }
    });
}
