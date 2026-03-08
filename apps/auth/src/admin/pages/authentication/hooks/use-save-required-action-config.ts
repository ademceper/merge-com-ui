import type RequiredActionConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { saveRequiredActionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useSaveRequiredActionConfig() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            alias: string;
            config: RequiredActionConfigRepresentation;
        }) => saveRequiredActionConfig(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
