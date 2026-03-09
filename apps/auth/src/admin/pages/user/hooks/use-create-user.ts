import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UserRepresentation) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        }
    });
}
