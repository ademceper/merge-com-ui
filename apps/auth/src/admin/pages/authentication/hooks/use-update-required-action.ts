import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRequiredAction } from "../../../api/authentication";
import type { DataType } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useUpdateRequiredAction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            action: DataType;
            field: "enabled" | "defaultAction";
        }) => updateRequiredAction(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.requiredActions()
            });
        }
    });
}
