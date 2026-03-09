import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useMutation } from "@tanstack/react-query";
import { createPolicy } from "@/admin/api/permissions";

export function useCreatePolicy(clientId: string) {
    return useMutation({
        mutationFn: ({ type, policy }: { type: string; policy: PolicyRepresentation }) =>
            createPolicy(clientId, type, policy)
    });
}
