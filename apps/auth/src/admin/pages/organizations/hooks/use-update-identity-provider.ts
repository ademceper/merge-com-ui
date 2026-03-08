import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentityProviderForOrg } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUpdateIdentityProvider() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            updateIdentityProviderForOrg(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.all
            });
        }
    });
}
