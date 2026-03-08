import type { ProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";

export const KEY_PROVIDER_TYPE = "org.keycloak.keys.KeyProvider";

const sortProvider = (
    a: [string, ProviderRepresentation],
    b: [string, ProviderRepresentation]
) => {
    let s1, s2;
    if (a[1].order !== b[1].order) {
        s1 = b[1].order;
        s2 = a[1].order;
    } else {
        s1 = a[0];
        s2 = b[0];
    }
    if (s1 < s2) {
        return -1;
    } else if (s1 > s2) {
        return 1;
    } else {
        return 0;
    }
};

export const sortProviders = (providers: { [index: string]: ProviderRepresentation }) => {
    return [...new Map(Object.entries(providers).sort(sortProvider)).keys()];
};
