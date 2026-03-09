import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveCredentialPositionDown, moveCredentialPositionUp } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useMoveCredentialDown(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            credentialId,
            newPreviousCredentialId
        }: {
            credentialId: string;
            newPreviousCredentialId: string;
        }) => moveCredentialPositionDown(userId, credentialId, newPreviousCredentialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}

export function useMoveCredentialUp(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentialId: string) =>
            moveCredentialPositionUp(userId, credentialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}
