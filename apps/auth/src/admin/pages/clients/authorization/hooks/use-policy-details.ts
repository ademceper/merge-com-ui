import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    findOnePolicyWithType,
    getAssociatedPolicies
} from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function usePolicyDetails(
    clientId: string,
    policyType: string,
    policyId?: string
) {
    return useQuery({
        queryKey: authzKeys.policyDetails(clientId, policyType, policyId),
        queryFn: async () => {
            if (policyId) {
                const result = await Promise.all([
                    findOnePolicyWithType(
                        clientId,
                        policyType,
                        policyId
                    ) as Promise<PolicyRepresentation | undefined>,
                    getAssociatedPolicies(clientId, policyId)
                ]);

                if (!result[0]) {
                    throw new Error("notFound");
                }

                return {
                    policy: result[0],
                    policies: result[1].map(p => p.id)
                };
            }
            return {};
        }
    });
}
