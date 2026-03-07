import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type UserFederationLdapTab = "settings" | "mappers";

export type UserFederationLdapParams = {
    realm: string;
    id: string;
    tab?: UserFederationLdapTab;
};

export const toUserFederationLdap = (params: UserFederationLdapParams): string => {
    const path = params.tab
        ? "/:realm/user-federation/ldap/:id/:tab"
        : "/:realm/user-federation/ldap/:id";
    return generateEncodedPath(path, params as any);
};
