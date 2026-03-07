import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type UserFederationLdapMapperParams = {
    realm: string;
    id: string;
    mapperId: string;
};

export const toUserFederationLdapMapper = (
    params: UserFederationLdapMapperParams
): string =>
    generateEncodedPath("/:realm/user-federation/ldap/:id/mappers/:mapperId", params);
