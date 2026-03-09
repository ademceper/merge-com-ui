import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    fetchClientRegistrationPolicyProviders,
    fetchComponent
} from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useRegistrationProvider(providerId: string, id?: string) {
    const { realm } = useRealm();
    return useQuery({
        queryKey: clientKeys.registrationProvider(providerId, id),
        queryFn: async () => {
            const [providers, data] = await Promise.all([
                fetchClientRegistrationPolicyProviders(realm),
                id ? fetchComponent(id) : Promise.resolve(undefined)
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
