import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateIdentityProviderMapper } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProviderMapper(alias: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapper: IdentityProviderMapperRepresentation) =>
            updateIdentityProviderMapper(adminClient, alias, mapper),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
