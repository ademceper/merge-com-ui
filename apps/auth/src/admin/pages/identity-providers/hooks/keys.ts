export const idpKeys = {
    all: ["identityProviders"] as const,
    lists: () => [...idpKeys.all, "list"] as const,
    list: (params: { realmOnly?: boolean }) => [...idpKeys.lists(), params] as const,
    detail: (alias: string) => [...idpKeys.all, "detail", alias] as const,
    mappers: (alias: string) => [...idpKeys.all, "mappers", alias] as const,
    mapperDetail: (alias: string, id: string) =>
        [...idpKeys.all, "mapperDetail", alias, id] as const,
    mapperTypes: (alias: string) => [...idpKeys.all, "mapperTypes", alias] as const,
    flows: () => [...idpKeys.all, "flows"] as const,
    orgProviders: (orgId: string) => [...idpKeys.all, "org", orgId] as const
};
