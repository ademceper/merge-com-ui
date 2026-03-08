import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchLdapServerCapabilities } from "../../../api/user-federation";

export function useLdapServerCapabilities() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: ({
            realm,
            settings
        }: {
            realm: string;
            settings: TestLdapConnectionRepresentation & { componentId?: string };
        }) => fetchLdapServerCapabilities(adminClient, realm, settings)
    });
}
