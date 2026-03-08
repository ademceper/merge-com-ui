export const federationKeys = {
    all: ["user-federation"] as const,
    list: (parentId: string) => [...federationKeys.all, "list", parentId] as const,
    detail: (id: string) => [...federationKeys.all, "detail", id] as const,
    mappers: (parentId: string) => [...federationKeys.all, "mappers", parentId] as const,
    mapperDetail: (id: string, mapperId: string) =>
        [...federationKeys.all, "mapperDetail", id, mapperId] as const,
    subComponents: (id: string) => [...federationKeys.all, "subComponents", id] as const,
    customComponent: (id: string) =>
        [...federationKeys.all, "customComponent", id] as const
};
