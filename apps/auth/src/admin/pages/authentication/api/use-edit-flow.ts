import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useEditFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: AuthenticationFlowRepresentation;
            formValues: AuthenticationFlowRepresentation;
        }) => updateFlow(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
