import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../../api/users";
import { userKeys } from "./keys";

export function useUpdateUser(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UserRepresentation) => updateUser(id, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        }
    });
}
