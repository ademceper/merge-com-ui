type Type = "resources" | "policies";

export type { Type };

export const typeMapping = {
    resources: {
        searchFunction: "listResources" as const,
        fetchFunction: "getAssociatedResources" as const
    },
    policies: {
        searchFunction: "listPolicies" as const,
        fetchFunction: "getAssociatedPolicies" as const
    }
};

export const authzKeys = {
    all: ["clientAuthorization"] as const,
    roles: () => [...authzKeys.all, "roles"] as const,
    resourcesAndScopes: (clientId: string) =>
        [...authzKeys.all, "resourcesAndScopes", clientId] as const,
    exportResource: (clientId: string) =>
        [...authzKeys.all, "exportResource", clientId] as const,
    detailCell: (clientId: string, resourceId: string) =>
        [...authzKeys.all, "detailCell", clientId, resourceId] as const,
    permissionDetails: (
        clientId: string,
        permissionType: string,
        permissionId?: string
    ) =>
        [
            ...authzKeys.all,
            "permissionDetails",
            clientId,
            permissionType,
            permissionId
        ] as const,
    permissions: (
        clientId: string,
        first: number,
        max: number,
        search: Record<string, unknown>
    ) => [...authzKeys.all, "permissions", clientId, first, max, search] as const,
    permissionProviders: (clientId: string) =>
        [...authzKeys.all, "permissionProviders", clientId] as const,
    policies: (
        clientId: string,
        first: number,
        max: number,
        search: Record<string, unknown>
    ) => [...authzKeys.all, "policies", clientId, first, max, search] as const,
    resources: (
        clientId: string,
        first: number,
        max: number,
        search: Record<string, unknown>
    ) => [...authzKeys.all, "resources", clientId, first, max, search] as const,
    scopes: (clientId: string, first: number, max: number, search: string) =>
        [...authzKeys.all, "scopes", clientId, first, max, search] as const,
    scopeDetails: (clientId: string, scopeId?: string) =>
        [...authzKeys.all, "scopeDetails", clientId, scopeId] as const,
    resourceDetails: (clientId: string, resourceId?: string) =>
        [...authzKeys.all, "resourceDetails", clientId, resourceId] as const,
    resourceServer: (clientId: string) =>
        [...authzKeys.all, "resourceServer", clientId] as const,
    policyDetails: (clientId: string, policyType: string, policyId?: string) =>
        [...authzKeys.all, "policyDetails", clientId, policyType, policyId] as const,
    clientScopes: () => [...authzKeys.all, "clientScopes"] as const,
    groups: (ids: string[]) => [...authzKeys.all, "groups", ...ids] as const,
    roleDetails: (ids: string[]) => [...authzKeys.all, "roleDetails", ...ids] as const,
    resourcesPolicySelect: (
        clientId: string,
        name: string,
        search: string,
        permissionId?: string,
        preSelected?: string
    ) =>
        [
            ...authzKeys.all,
            "resourcesPolicySelect",
            clientId,
            name,
            search,
            permissionId,
            preSelected
        ] as const,
    selectedItems: (clientId: string, name: Type, value: string[]) =>
        [...authzKeys.all, "selectedItems", clientId, name, ...value] as const,
    scopeSelect: (clientId: string, resourceId?: string, search?: string) =>
        [...authzKeys.all, "scopeSelect", clientId, resourceId, search] as const,
    scopePicker: (clientId: string, search: string) =>
        [...authzKeys.all, "scopePicker", clientId, search] as const
};
