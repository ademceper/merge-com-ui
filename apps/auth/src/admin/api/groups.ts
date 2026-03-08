import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

// ── Find / list ─────────────────────────────────────────────────────────

export async function findGroups(adminClient: KeycloakAdminClient) {
    return adminClient.groups.find({ first: 0, max: 1000 });
}

export async function findGroup(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.groups.findOne({ id });
}

export async function findSubGroups(
    adminClient: KeycloakAdminClient,
    parentId: string,
    first = 0,
    max = 1000
) {
    return adminClient.groups.listSubGroups({ parentId, first, max });
}

// ── Tree (admin-ui endpoint) ────────────────────────────────────────────

export async function fetchGroupTree(
    adminClient: KeycloakAdminClient,
    params: {
        first: number;
        max: number;
        search: string;
    }
) {
    const { first, max, search } = params;
    return fetchAdminUI<GroupRepresentation[]>(
        adminClient,
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
    adminClient: KeycloakAdminClient,
    activeItemId: string,
    firstSub: number,
    subGroupCount: number
) {
    return fetchAdminUI<GroupRepresentation[]>(
        adminClient,
        `groups/${activeItemId}/children`,
        {
            first: `${firstSub}`,
            max: `${subGroupCount}`
        }
    );
}

// ── Members ─────────────────────────────────────────────────────────────

export async function fetchGroupMembers(
    adminClient: KeycloakAdminClient,
    id: string,
    briefRepresentation = true,
    first = 0,
    max = 500
) {
    return adminClient.groups.listMembers({ id, briefRepresentation, first, max });
}

// ── Mutations ───────────────────────────────────────────────────────────

export async function deleteGroup(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.groups.del({ id });
}

export async function updateGroup(
    adminClient: KeycloakAdminClient,
    id: string,
    group: GroupRepresentation
) {
    return adminClient.groups.update({ id }, group);
}

// ── User-group membership ───────────────────────────────────────────────

export async function fetchUserGroups(
    adminClient: KeycloakAdminClient,
    id: string,
    first = 0,
    max = 500
) {
    return adminClient.users.listGroups({ id, first, max });
}

export async function addUserToGroup(
    adminClient: KeycloakAdminClient,
    id: string,
    groupId: string
) {
    return adminClient.users.addToGroup({ id, groupId });
}

export async function removeUserFromGroup(
    adminClient: KeycloakAdminClient,
    id: string,
    groupId: string
) {
    return adminClient.users.delFromGroup({ id, groupId });
}
