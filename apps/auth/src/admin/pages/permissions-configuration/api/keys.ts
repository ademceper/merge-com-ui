export const permissionsKeys = {
    all: ["permissions-configuration"] as const,
    adminPermissionsClient: () =>
        [...permissionsKeys.all, "adminPermissionsClient"] as const,
    list: (
        clientId: string,
        search: Record<string, unknown>,
        first: number,
        max: number
    ) => [...permissionsKeys.all, "list", clientId, search, first, max] as const,
    detail: (clientId: string, permissionId: string) =>
        [...permissionsKeys.all, "detail", clientId, permissionId] as const,
    providers: (clientId: string) =>
        [...permissionsKeys.all, "providers", clientId] as const,
    policies: (clientId: string, filterType?: string) =>
        [...permissionsKeys.all, "policies", clientId, filterType] as const,
    policyDetails: (clientId: string, policyValues: string[]) =>
        [...permissionsKeys.all, "policyDetails", clientId, policyValues] as const,
    groupDetails: (ids: string[]) =>
        [...permissionsKeys.all, "groupDetails", ids] as const,
    roleDetails: (ids: string[]) => [...permissionsKeys.all, "roleDetails", ids] as const
};
