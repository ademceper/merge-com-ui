import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type UserFederationsLdapParams = { realm: string };

const toUserFederationsLdap = (
    params: UserFederationsLdapParams
): string =>
    generateEncodedPath("/:realm/user-federation/ldap", params);
