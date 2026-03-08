import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateRequiredAction } from "../../../api/authentication";
import type { DataType } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useUpdateRequiredAction() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            action: DataType;
            field: "enabled" | "defaultAction";
        }) => updateRequiredAction(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.requiredActions()
            });
        }
    });
}
