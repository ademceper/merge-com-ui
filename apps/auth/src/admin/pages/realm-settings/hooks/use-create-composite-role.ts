import { useMutation } from "@tanstack/react-query";
import { createCompositeRole } from "../../../api/realm-settings";

export function useCreateCompositeRole() {
    return useMutation({
        mutationFn: ({
            roleId,
            roles
        }: {
            roleId: string;
            roles: { id: string; name: string }[];
        }) => createCompositeRole(roleId, roles)
    });
}
