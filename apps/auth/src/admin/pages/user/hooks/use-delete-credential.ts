import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserCredential } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useDeleteCredential(userId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentialId: string) =>
            deleteUserCredential(adminClient, userId, credentialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}
