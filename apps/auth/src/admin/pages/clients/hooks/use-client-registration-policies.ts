import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchClientRegistrationPolicies } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useClientRegistrationPolicies(subType: string) {
    return useQuery({
        queryKey: clientKeys.registrationPolicies(subType),
        queryFn: async () => {
            const policies = await fetchClientRegistrationPolicies();
            return policies.filter((p: ComponentRepresentation) => p.subType === subType);
        }
    });
}
