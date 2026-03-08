import { useMutation, useQueryClient } from "@tanstack/react-query";
import { copyFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useDuplicateFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: string;
            newName: string;
            description?: string;
            originalDescription?: string;
        }) => copyFlow(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
