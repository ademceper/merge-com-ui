import type AuthenticatorConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveExecutionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useSaveExecutionConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            config?: AuthenticatorConfigRepresentation;
            executionId: string;
            changedConfig: { alias?: string; config?: Record<string, string> };
        }) => saveExecutionConfig(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
