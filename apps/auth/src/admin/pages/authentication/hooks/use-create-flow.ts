import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { createFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useCreateFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flow: AuthenticationFlowRepresentation) =>
            createFlow(adminClient, flow),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
