import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCredentialLabel } from "../../../api/users";
import { userKeys } from "./keys";

export function useUpdateCredentialLabel(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ credentialId, label }: { credentialId: string; label: string }) =>
            updateCredentialLabel(userId, credentialId, label),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}
