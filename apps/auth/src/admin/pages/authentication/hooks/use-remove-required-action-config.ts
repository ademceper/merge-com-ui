import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeRequiredActionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useRemoveRequiredActionConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            removeRequiredActionConfig(alias),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
