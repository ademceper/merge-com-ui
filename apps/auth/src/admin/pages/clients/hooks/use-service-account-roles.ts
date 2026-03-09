import { useMutation } from "@tanstack/react-query";
import { addUserRealmRoleMappings, addUserClientRoleMappings } from "@/admin/api/clients";

export function useAssignServiceAccountRoles() {
    return useMutation({
        mutationFn: async ({
            userId,
            realmRoles,
            clientRoles
        }: {
            userId: string;
            realmRoles: Record<string, unknown>[];
            clientRoles: { clientUniqueId: string; roles: Record<string, unknown>[] }[];
        }) => {
            await addUserRealmRoleMappings(userId, realmRoles);
            await Promise.all(
                clientRoles.map(({ clientUniqueId, roles }) =>
                    addUserClientRoleMappings(userId, clientUniqueId, roles)
                )
            );
        }
    });
}
