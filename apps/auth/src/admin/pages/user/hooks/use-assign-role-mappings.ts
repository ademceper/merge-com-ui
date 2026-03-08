import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useMutation } from "@tanstack/react-query";
import { addRealmRoleMappings, addClientRoleMappings } from "../../../api/users";

type AssignRoleMappingsParams = {
    userId: string;
    realmRoles: RoleMappingPayload[];
    clientRoles: { clientId: string; roles: RoleMappingPayload[] }[];
};

export function useAssignRoleMappings() {
    return useMutation({
        mutationFn: async ({ userId, realmRoles, clientRoles }: AssignRoleMappingsParams) => {
            if (realmRoles.length > 0) {
                await addRealmRoleMappings(userId, realmRoles);
            }
            await Promise.all(
                clientRoles.map(({ clientId, roles }) =>
                    addClientRoleMappings(userId, clientId, roles)
                )
            );
        }
    });
}
