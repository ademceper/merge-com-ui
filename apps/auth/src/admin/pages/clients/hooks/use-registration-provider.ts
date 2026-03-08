import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    fetchClientRegistrationPolicyProviders,
    fetchComponent
} from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useRegistrationProvider(providerId: string, id?: string) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: clientKeys.registrationProvider(providerId, id),
        queryFn: async () => {
            const [providers, data] = await Promise.all([
                fetchClientRegistrationPolicyProviders(adminClient, realm),
                id ? fetchComponent(adminClient, id) : Promise.resolve(undefined)
            ]);
            return {
                provider: providers.find(
                    (p: ComponentTypeRepresentation) => p.id === providerId
                ),
                data
            };
        }
    });
}
