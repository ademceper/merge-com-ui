import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentityProviderOrder } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProviderOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (
            providers: { alias: string; provider: IdentityProviderRepresentation }[]
        ) => updateIdentityProviderOrder(providers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.lists() });
        }
    });
}
