import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addExecutionToFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAddExecutionToFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: { flow: string; provider: string }) =>
            addExecutionToFlow(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
