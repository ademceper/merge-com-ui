import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExecution } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useUpdateExecution() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flowAlias: string;
            execution: Record<string, unknown>;
        }) => updateExecution(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
