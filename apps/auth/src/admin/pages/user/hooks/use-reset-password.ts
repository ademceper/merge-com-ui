import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetUserPassword } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useResetPassword(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credential: CredentialRepresentation) =>
            resetUserPassword(userId, credential),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.credentials(userId) });
        }
    });
}
