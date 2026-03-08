import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateIdentityProviderForOrg } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUpdateIdentityProvider() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            updateIdentityProviderForOrg(adminClient, provider),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.all
            });
        }
    });
}
