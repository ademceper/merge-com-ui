import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { adminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

// ── Find / list ─────────────────────────────────────────────────────────

export async function findGroups() {
    return adminClient.groups.find({ first: 0, max: 1000 });
}

export async function findGroup(id: string) {
    return adminClient.groups.findOne({ id });
}

export async function findSubGroups(
    parentId: string,
    first = 0,
    max = 1000
) {
    return adminClient.groups.listSubGroups({ parentId, first, max });
}

// ── Tree (admin-ui endpoint) ────────────────────────────────────────────

export async function fetchGroupTree(
    params: {
        first: number;
        max: number;
        search: string;
    }
) {
    const { first, max, search } = params;
    return fetchAdminUI<GroupRepresentation[]>(
        "groups",
        Object.assign(
            {
                first: `${first}`,
                max: `${max + 1}`,
                exact: "false",
                global: `${search !== ""}`
            },
            search === "" ? null : { search }
        )
    );
}

export async function fetchGroupChildren(
    activeItemId: string,
    firstSub: number,
    subGroupCount: number
) {
    return fetchAdminUI<GroupRepresentation[]>(
        `groups/${activeItemId}/children`,
        {
            first: `${firstSub}`,
            max: `${subGroupCount}`
        }
    );
}

// ── Members ─────────────────────────────────────────────────────────────

export async function fetchGroupMembers(
    id: string,
    briefRepresentation = true,
    first = 0,
    max = 500
) {
    return adminClient.groups.listMembers({ id, briefRepresentation, first, max });
}

// ── Mutations ───────────────────────────────────────────────────────────

export async function deleteGroup(id: string) {
    return adminClient.groups.del({ id });
}

export async function createGroup(group: GroupRepresentation) {
    return adminClient.groups.create(group);
}

export async function updateGroup(
    id: string,
    group: GroupRepresentation
) {
    return adminClient.groups.update({ id }, group);
}

export async function createChildGroup(
    parentId: string,
    group: GroupRepresentation
) {
    return adminClient.groups.createChildGroup({ id: parentId }, group);
}

export async function updateChildGroup(
    parentId: string,
    group: GroupRepresentation
) {
    return adminClient.groups.updateChildGroup({ id: parentId }, group);
}

export async function updateRoot(group: GroupRepresentation) {
    return adminClient.groups.updateRoot(group);
}

// ── Role mappings ───────────────────────────────────────────────────────

export async function listRealmRoleMappings(groupId: string) {
    return adminClient.groups.listRealmRoleMappings({ id: groupId });
}

export async function addRealmRoleMappings(
    groupId: string,
    roles: { id: string; name: string }[]
) {
    return adminClient.groups.addRealmRoleMappings({ id: groupId, roles });
}

export async function listClientRoleMappings(
    groupId: string,
    clientUniqueId: string
) {
    return adminClient.groups.listClientRoleMappings({ id: groupId, clientUniqueId });
}

export async function addClientRoleMappings(
    groupId: string,
    clientUniqueId: string,
    roles: { id: string; name: string }[]
) {
    return adminClient.groups.addClientRoleMappings({ id: groupId, clientUniqueId, roles });
}

// ── Permissions ─────────────────────────────────────────────────────────

export async function listGroupPermissions(groupId: string) {
    return adminClient.groups.listPermissions({ id: groupId });
}

export async function updateGroupPermission(
    groupId: string,
    permissions: Record<string, unknown>
) {
    return adminClient.groups.updatePermission({ id: groupId }, permissions);
}

// ── Clients (for duplication) ───────────────────────────────────────────

export async function findAllClients() {
    return adminClient.clients.find();
}

// ── Users ───────────────────────────────────────────────────────────────

export async function findUsers(params: { first?: number; max?: number; search?: string }) {
    return adminClient.users.find(params);
}

// ── User-group membership ───────────────────────────────────────────────

export async function fetchUserGroups(
    id: string,
    first = 0,
    max = 500
) {
    return adminClient.users.listGroups({ id, first, max });
}

export async function addUserToGroup(
    id: string,
    groupId: string
) {
    return adminClient.users.addToGroup({ id, groupId });
}

export async function removeUserFromGroup(
    id: string,
    groupId: string
) {
    return adminClient.users.delFromGroup({ id, groupId });
}
