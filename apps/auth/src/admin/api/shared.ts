import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { ManagementPermissionReference } from "@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import type { ClientQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import type { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";
import { adminClient } from "../app/admin-client";
import { getAuthorizationHeaders } from "../shared/lib/get-authorization-headers";
import { addTrailingSlash, prettyPrintJSON } from "../shared/lib/util";

// ── Users ──

export async function searchUsers(username: string) {
    return adminClient.users.find({ username, max: 20 });
}

export async function findUsersByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    const foundUsers = await Promise.all(
        ids.map(id => adminClient.users.findOne({ id }))
    );
    return foundUsers.filter((user): user is UserRepresentation => user !== undefined);
}

export async function findCurrentUser(userId: string) {
    return adminClient.users.findOne({ id: userId });
}

export async function fetchUserProfile() {
    return adminClient.users.getProfile();
}

// ── Groups ──

export async function findGroupPicker(
    groupId: string | undefined,
    filter: string,
    first: number,
    max: number,
    userId?: string
) {
    let group;
    let groups;
    let existingUserGroups;

    if (!groupId) {
        const args: Record<string, unknown> = { first, max: max + 1 };
        if (filter !== "") {
            args.search = filter;
        }
        groups = await adminClient.groups.find(
            args as Parameters<typeof adminClient.groups.find>[0]
        );
    } else {
        group = await adminClient.groups.findOne({ id: groupId });
        groups = await adminClient.groups.listSubGroups({
            first,
            max,
            parentId: groupId
        });
    }

    if (userId) {
        existingUserGroups = await adminClient.users.listGroups({
            id: userId
        });
    }

    return { group, groups, existingUserGroups };
}

// ── Identity providers ──

export async function searchIdentityProviders(
    search: string,
    identityProviderType: string,
    realmOnly: boolean
) {
    const params: IdentityProvidersQuery = {
        max: 20,
        type: identityProviderType as IdentityProvidersQuery["type"],
        realmOnly
    };
    if (search) {
        params.search = search;
    }
    return adminClient.identityProviders.find(params);
}

// ── Clients ──

export async function searchClients(search: string) {
    const params: ClientQuery = { max: 20 };
    if (search) {
        params.clientId = search;
        params.search = true;
    }
    return adminClient.clients.find(params);
}

export async function findClientsByValues(
    values: string[],
    clientKey: keyof ClientRepresentation
) {
    const clients = await Promise.all(
        values.map(async clientId => {
            if (clientKey === "clientId") {
                return (await adminClient.clients.find({ clientId }))[0];
            }
            return adminClient.clients.findOne({ id: clientId });
        })
    );
    return clients
        .filter((client): client is ClientRepresentation => !!client)
        .map(client => ({
            key: client[clientKey] as string,
            value: client.clientId!
        }));
}

// ── Permissions ──

type PermissionScreenType =
    | "clients"
    | "users"
    | "groups"
    | "roles"
    | "identityProviders";

export async function fetchPermissions(
    id: string | undefined,
    type: PermissionScreenType,
    realm: string
) {
    const [clients, permission] = await Promise.all([
        adminClient.clients.find({
            search: true,
            clientId: realm === "master" ? "master-realm" : "realm-management"
        }),
        (() => {
            switch (type) {
                case "clients":
                    return adminClient.clients.listFineGrainPermissions({
                        id: id!
                    });
                case "users":
                    return adminClient.realms.getUsersManagementPermissions({
                        realm
                    });
                case "groups":
                    return adminClient.groups.listPermissions({
                        id: id!
                    });
                case "roles":
                    return adminClient.roles.listPermissions({
                        id: id!
                    });
                case "identityProviders":
                    return adminClient.identityProviders.listPermissions({
                        alias: id!
                    });
            }
        })()
    ]);
    return {
        realmId: clients[0]?.id!,
        permission: permission as ManagementPermissionReference
    };
}

export async function togglePermissionEnabled(
    id: string | undefined,
    type: PermissionScreenType,
    realm: string,
    enabled: boolean
) {
    switch (type) {
        case "clients":
            return adminClient.clients.updateFineGrainPermission(
                { id: id! },
                { enabled }
            );
        case "users":
            return adminClient.realms.updateUsersManagementPermissions({
                realm,
                enabled
            });
        case "groups":
            return adminClient.groups.updatePermission({ id: id! }, { enabled });
        case "roles":
            return adminClient.roles.updatePermission({ id: id! }, { enabled });
        case "identityProviders":
            return adminClient.identityProviders.updatePermission(
                { alias: id! },
                { enabled }
            );
    }
}

// ── Resource server ──

export async function fetchResourceServer(
    clientId: string
) {
    return adminClient.clients.getResourceServer({ id: clientId });
}

// ── Installation / Download ──

export async function fetchInstallationSnippet(
    id: string,
    selected: string,
    mediaType: string | undefined,
    realm: string
): Promise<string | ArrayBuffer> {
    if (mediaType === "application/zip") {
        const response = await fetchWithError(
            `${addTrailingSlash(
                adminClient.baseUrl
            )}admin/realms/${realm}/clients/${id}/installation/providers/${selected}`,
            {
                method: "GET",
                headers: getAuthorizationHeaders(await adminClient.getAccessToken())
            }
        );
        return response.arrayBuffer();
    }
    const snippet = await adminClient.clients.getInstallationProviders({
        id,
        providerId: selected
    });
    if (typeof snippet === "string") {
        return snippet;
    }
    return prettyPrintJSON(snippet);
}
