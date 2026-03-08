export const organizationKeys = {
    all: ["organizations"] as const,
    lists: () => [...organizationKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...organizationKeys.lists(), filters] as const,
    detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
    members: (orgId: string, filters?: Record<string, unknown>) =>
        [...organizationKeys.all, "members", orgId, filters] as const,
    invitations: (orgId: string, filters?: Record<string, unknown>) =>
        [...organizationKeys.all, "invitations", orgId, filters] as const,
    identityProviders: (orgId: string) =>
        [...organizationKeys.all, "identityProviders", orgId] as const,
    hasProviders: () => [...organizationKeys.all, "hasProviders"] as const
};
