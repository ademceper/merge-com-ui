import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { testLdapConnection } from "../../../api/user-federation";

export function useTestLdapConnection() {
    const { adminClient } = useAdminClient();
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
        }) => testLdapConnection(adminClient, realm, settings)
    });
}
