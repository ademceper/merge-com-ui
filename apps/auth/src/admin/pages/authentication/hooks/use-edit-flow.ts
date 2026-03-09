import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlow } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useEditFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: AuthenticationFlowRepresentation;
            formValues: AuthenticationFlowRepresentation;
        }) => updateFlow(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
