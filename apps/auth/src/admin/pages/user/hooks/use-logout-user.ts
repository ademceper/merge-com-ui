import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../../api/users";
import { userKeys } from "./keys";

export function useLogoutUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => logoutUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        }
    });
}
