export const clientScopeKeys = {
    all: ["clientScopes"] as const,
    lists: () => [...clientScopeKeys.all, "list"] as const,
    detail: (id: string) => [...clientScopeKeys.all, "detail", id] as const,
    realmKeys: () => [...clientScopeKeys.all, "realmKeys"] as const,
    protocolMapper: (id: string, mapperId: string) =>
        [...clientScopeKeys.all, "protocolMapper", id, mapperId] as const,
    mapperModel: (id: string) => [...clientScopeKeys.all, "mapperModel", id] as const
};
