import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        }
    });
}
