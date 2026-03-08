import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { removeRequiredActionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useRemoveRequiredActionConfig() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            removeRequiredActionConfig(adminClient, alias),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
