import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchClientRegistrationPolicies } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClientRegistrationPolicies(subType: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.registrationPolicies(subType),
        queryFn: async () => {
            const policies = await fetchClientRegistrationPolicies(adminClient);
            return policies.filter((p: ComponentRepresentation) => p.subType === subType);
        }
    });
}
