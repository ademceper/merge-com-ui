import type { FilterType } from "../ui/role-mapping/add-role-mapping-modal";
import type { ResourcesKey } from "../ui/role-mapping/role-mapping";

export type PermissionScreenType =
    | "clients"
    | "users"
    | "groups"
    | "roles"
    | "identityProviders";

export const sharedKeys = {
    users: {
        all: ["shared", "users"] as const,
        search: (search: string) => [...sharedKeys.users.all, "search", search] as const,
        byIds: (ids: string[] | undefined) =>
            [...sharedKeys.users.all, "byIds", ids] as const,
        profile: () => [...sharedKeys.users.all, "profile"] as const,
        current: (userId: string) => [...sharedKeys.users.all, "current", userId] as const
    },
    groups: {
        all: ["shared", "groups"] as const,
        picker: (
            groupId: string | undefined,
            filter: string,
            first: number,
            max: number
        ) => [...sharedKeys.groups.all, "picker", groupId, filter, first, max] as const,
        userGroups: (userId: string | undefined) =>
            [...sharedKeys.groups.all, "userGroups", userId] as const
    },
    identityProviders: {
        all: ["shared", "identityProviders"] as const,
        search: (search: string, type: string, realmOnly: boolean) =>
            [
                ...sharedKeys.identityProviders.all,
                "search",
                search,
                type,
                realmOnly
            ] as const
    },
    clients: {
        all: ["shared", "clients"] as const,
        search: (search: string) =>
            [...sharedKeys.clients.all, "search", search] as const,
        byValues: (values: string[], clientKey: string) =>
            [...sharedKeys.clients.all, "byValues", values, clientKey] as const
    },
    roles: {
        all: ["shared", "roles"] as const,
        list: (parentRoleId: string | undefined) =>
            [...sharedKeys.roles.all, "list", parentRoleId] as const,
        available: (id: string, type: ResourcesKey, filterType: FilterType) =>
            [...sharedKeys.roles.all, "available", id, type, filterType] as const
    },
    permissions: {
        all: ["shared", "permissions"] as const,
        detail: (id: string | undefined, type: string, realm: string) =>
            [...sharedKeys.permissions.all, id, type, realm] as const
    },
    resourceServer: {
        all: ["shared", "resourceServer"] as const,
        byClient: (clientId: string) =>
            [...sharedKeys.resourceServer.all, clientId] as const
    },
    installationProviders: {
        all: ["shared", "installationProviders"] as const,
        snippet: (id: string, selected: string) =>
            [...sharedKeys.installationProviders.all, id, selected] as const
    }
};
