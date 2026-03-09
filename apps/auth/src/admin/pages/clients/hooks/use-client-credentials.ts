import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    fetchClientAuthenticatorProviders,
    fetchClientSecret
} from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useClientCredentials(clientId: string) {
    return useQuery({
        queryKey: clientKeys.credentials(clientId),
        queryFn: async () => {
            const [providers, secret] = await Promise.all([
                fetchClientAuthenticatorProviders(),
                fetchClientSecret(clientId)
            ]);
            return {
                providers: providers as AuthenticationProviderRepresentation[],
                secret: secret.value!
            };
        }
    });
}
