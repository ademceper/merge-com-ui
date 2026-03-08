import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateClientPolicy } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useUpdateClientPolicy() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (policies: { policies?: any[]; globalPolicies?: any[] }) =>
            updateClientPolicy(adminClient, policies),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.clientPolicies()
            });
        }
    });
}
