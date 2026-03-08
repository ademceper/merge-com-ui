export const pageKeys = {
    all: ["pages"] as const,
    list: (realmId: string | undefined) => [...pageKeys.all, "list", realmId] as const,
    detail: (id: string) => [...pageKeys.all, "detail", id] as const,
    handlerData: (id: string | undefined, providerType: string) =>
        [...pageKeys.all, "handler", id, providerType] as const
};
