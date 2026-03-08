import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { createIdentityProviderMapper } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useCreateIdentityProviderMapper(alias: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapper: IdentityProviderMapperRepresentation) =>
            createIdentityProviderMapper(adminClient, alias, mapper),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
