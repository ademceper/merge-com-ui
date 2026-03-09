import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    findIdentityProviderByAlias,
    linkOrganizationIdp,
    updateIdentityProviderByAlias
} from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

type LinkParams = {
    alias: string;
    config: Record<string, unknown>;
    hideOnLogin: boolean;
    isNew: boolean;
};

/**
 * Link (or update) an identity provider to an organization.
 */
export function useLinkIdentityProvider(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: LinkParams) => {
            const foundProvider = await findIdentityProviderByAlias(params.alias);
            if (!foundProvider) {
                throw new Error("Identity provider not found");
            }
            foundProvider.config = {
                ...foundProvider.config,
                ...params.config
            };
            foundProvider.hideOnLogin = params.hideOnLogin;
            await updateIdentityProviderByAlias(params.alias, foundProvider);

            if (params.isNew) {
                await linkOrganizationIdp(orgId, params.alias);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.identityProviders(orgId)
            });
        }
    });
}
