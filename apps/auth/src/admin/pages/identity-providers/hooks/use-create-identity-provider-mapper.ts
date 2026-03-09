import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdentityProviderMapper } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useCreateIdentityProviderMapper(alias: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapper: IdentityProviderMapperRepresentation) =>
            createIdentityProviderMapper(alias, mapper),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
