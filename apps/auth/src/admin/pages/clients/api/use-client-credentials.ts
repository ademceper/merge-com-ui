import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    fetchClientAuthenticatorProviders,
    fetchClientSecret
} from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClientCredentials(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.credentials(clientId),
        queryFn: async () => {
            const [providers, secret] = await Promise.all([
                fetchClientAuthenticatorProviders(adminClient),
                fetchClientSecret(adminClient, clientId)
            ]);
            return {
                providers: providers as AuthenticationProviderRepresentation[],
                secret: secret.value!
            };
        }
    });
}
