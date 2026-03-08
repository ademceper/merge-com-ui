import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useCreateFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flow: AuthenticationFlowRepresentation) =>
            createFlow(flow),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
