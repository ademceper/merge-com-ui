export const realmKeys = {
    all: ["realms"] as const,
    names: (realm: string) => [...realmKeys.all, "names", realm] as const
};
