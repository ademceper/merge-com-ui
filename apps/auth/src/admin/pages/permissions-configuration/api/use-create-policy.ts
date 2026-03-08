import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { useMutation } from "@tanstack/react-query";
import { createPolicy } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";

export function useCreatePolicy(clientId: string) {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: ({ type, policy }: { type: string; policy: PolicyRepresentation }) =>
            createPolicy(adminClient, clientId, type, policy)
    });
}
