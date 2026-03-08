import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createGroup,
    createChildGroup,
    fetchGroupMembers,
    addUserToGroup,
    listGroupPermissions,
    updateGroupPermission,
    listRealmRoleMappings,
    listClientRoleMappings,
    addRealmRoleMappings,
    addClientRoleMappings,
    findAllClients,
    findSubGroups
} from "../../../api/groups";
import { groupKeys } from "./keys";

type RoleMappingPayload = {
    id: string;
    name?: string;
    clientUniqueId?: string;
};

type ClientRoleMapping = {
    clientId: string;
    roles: RoleMappingPayload[];
};

async function fetchClientRoleMappingsForGroup(groupId: string): Promise<ClientRoleMapping[]> {
    const clientRoleMappings: ClientRoleMapping[] = [];
    const clients = await findAllClients();

    for (const client of clients) {
        const roles = await listClientRoleMappings(groupId, client.id!);
        const clientRoles = roles
            .filter(role => role.id && role.name)
            .map(role => ({ id: role.id!, name: role.name! }));
        if (clientRoles.length > 0) {
            clientRoleMappings.push({ clientId: client.id!, roles: clientRoles });
        }
    }
    return clientRoleMappings;
}

async function assignRolesToGroup(roles: RoleMappingPayload[], groupId: string) {
    const realmRoles = roles.filter(role => !role.clientUniqueId && role.name);
    const clientRoles = roles.filter(role => role.clientUniqueId && role.name);

    await addRealmRoleMappings(
        groupId,
        realmRoles.map(({ id, name }) => ({ id, name: name! }))
    );

    await Promise.all(
        clientRoles.map(clientRole => {
            if (clientRole.clientUniqueId && clientRole.name) {
                return addClientRoleMappings(groupId, clientRole.clientUniqueId, [
                    { id: clientRole.id, name: clientRole.name }
                ]);
            }
            return Promise.resolve();
        })
    );
}

async function duplicateGroupRecursive(
    sourceGroup: GroupRepresentation,
    copyName: string,
    parentId?: string,
    isSubGroup: boolean = false,
    checkPermissions: boolean = false
): Promise<GroupRepresentation> {
    const newGroup: GroupRepresentation = {
        ...sourceGroup,
        name: isSubGroup ? sourceGroup.name : copyName
    };
    delete newGroup.id;

    const createdGroup = parentId
        ? await createChildGroup(parentId, newGroup)
        : await createGroup(newGroup);

    const members = await fetchGroupMembers(sourceGroup.id!);
    for (const member of members) {
        await addUserToGroup(member.id!, createdGroup.id);
    }

    if (checkPermissions) {
        const permissions = await listGroupPermissions(sourceGroup.id!);
        if (permissions) {
            await updateGroupPermission(
                createdGroup.id,
                permissions as unknown as Record<string, unknown>
            );
        }
    }

    const realmRoles = await listRealmRoleMappings(sourceGroup.id!);
    const realmRolesPayload: RoleMappingPayload[] = realmRoles.map(role => ({
        id: role.id!,
        name: role.name!
    }));

    const clientRoleMappings = await fetchClientRoleMappingsForGroup(sourceGroup.id!);
    const clientRolesPayload: RoleMappingPayload[] = clientRoleMappings.flatMap(
        clientRoleMapping =>
            clientRoleMapping.roles.map(role => ({
                id: role.id!,
                name: role.name!,
                clientUniqueId: clientRoleMapping.clientId
            }))
    );

    await assignRolesToGroup(
        [...realmRolesPayload, ...clientRolesPayload],
        createdGroup.id
    );

    const subGroups = await findSubGroups(sourceGroup.id!);
    for (const childGroup of subGroups) {
        await duplicateGroupRecursive(
            { ...childGroup, attributes: childGroup.attributes },
            copyName,
            createdGroup.id,
            true,
            checkPermissions
        );
    }

    return createdGroup;
}

/**
 * Duplicate a group with all its members, roles, permissions and sub-groups.
 */
export function useDuplicateGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            sourceGroup: GroupRepresentation;
            copyName: string;
            checkPermissions?: boolean;
        }) =>
            duplicateGroupRecursive(
                params.sourceGroup,
                params.copyName,
                undefined,
                false,
                params.checkPermissions
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
