import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import { useMutation } from "@tanstack/react-query";
import { testLdapConnection } from "@/admin/api/user-federation";

export function useTestLdapConnection() {
    return useMutation({
        mutationFn: ({
            realm,
            settings
        }: {
            realm: string;
            settings: TestLdapConnectionRepresentation & {
                action: string;
                componentId?: string;
            };
        }) => testLdapConnection(realm, settings)
    });
}
