import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash-es";
import {
    findIdentityProviderExists,
    findIdentityProviders
} from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProvidersList(hideOrgLinked: boolean) {

    return useQuery({
        queryKey: [...idpKeys.lists(), { realmOnly: hideOrgLinked, section: true }],
        queryFn: async (): Promise<{
            hasProviders: boolean;
            providers: IdentityProviderRepresentation[];
        }> => {
            const [hasProviders, list] = await Promise.all([
                findIdentityProviderExists(),
                findIdentityProviders({ realmOnly: hideOrgLinked })
            ]);
            return {
                hasProviders,
                providers: sortBy(list ?? [], [
                    p => Number(p.config?.guiOrder ?? 0),
                    "alias"
                ])
            };
        }
    });
}
