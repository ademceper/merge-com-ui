import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewLdapUserFederationParams = { realm: string };

const toNewLdapUserFederation = (
    params: NewLdapUserFederationParams
): string =>
    generateEncodedPath("/:realm/user-federation/ldap/new", params);
