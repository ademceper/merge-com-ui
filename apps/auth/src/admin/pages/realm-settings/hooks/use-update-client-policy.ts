import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientPolicy } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useUpdateClientPolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (policies: { policies?: any[]; globalPolicies?: any[] }) =>
            updateClientPolicy(policies),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.clientPolicies()
            });
        }
    });
}
