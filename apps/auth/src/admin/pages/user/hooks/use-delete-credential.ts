import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserCredential } from "../../../api/users";
import { userKeys } from "./keys";

export function useDeleteCredential(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentialId: string) =>
            deleteUserCredential(userId, credentialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}
