import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../../api/sessions";
import { sessionKeys } from "./keys";

export function useLogoutUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => logoutUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: sessionKeys.all
            });
        }
    });
}
