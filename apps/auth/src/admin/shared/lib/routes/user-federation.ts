import { generateEncodedPath } from "../generateEncodedPath";

type UserFederationParams = { realm: string };

export const toUserFederation = (params: UserFederationParams): string =>
    generateEncodedPath("/:realm/user-federation", params);

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

export type UserFederationLdapMapperParams = {
    realm: string;
    id: string;
    mapperId: string;
};

export const toUserFederationLdapMapper = (
    params: UserFederationLdapMapperParams
): string =>
    generateEncodedPath("/:realm/user-federation/ldap/:id/mappers/:mapperId", params);

export type CustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
    id: string;
};

export const toCustomUserFederation = (params: CustomUserFederationRouteParams): string =>
    generateEncodedPath("/:realm/user-federation/:providerId/:id", params);

type NewCustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
};

export const toNewCustomUserFederation = (
    params: NewCustomUserFederationRouteParams
): string => generateEncodedPath("/:realm/user-federation/:providerId/new", params);

type UserFederationKerberosParams = {
    realm: string;
    id: string;
};

export const toUserFederationKerberos = (params: UserFederationKerberosParams): string =>
    generateEncodedPath("/:realm/user-federation/kerberos/:id", params);
