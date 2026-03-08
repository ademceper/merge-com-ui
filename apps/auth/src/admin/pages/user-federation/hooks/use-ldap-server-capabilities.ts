import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import { useMutation } from "@tanstack/react-query";
import { fetchLdapServerCapabilities } from "../../../api/user-federation";

export function useLdapServerCapabilities() {
    return useMutation({
        mutationFn: ({
            realm,
            settings
        }: {
            realm: string;
            settings: TestLdapConnectionRepresentation & { componentId?: string };
        }) => fetchLdapServerCapabilities(realm, settings)
    });
}
